package com.justicelinker.service;

import com.justicelinker.dto.ComplaintDTO;
import com.justicelinker.model.*;
import com.justicelinker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final MandalRepository mandalRepository;
    private final VillageRepository villageRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    private final EmailService emailService;

    @Value("${app.max-complaints-per-month}")
    private int maxComplaintsPerMonth;

    // We enforce strict transitions for normal admins, but allow SUPER_ADMIN to
    // bypass them.
    private static final Map<Complaint.ComplaintStatus, Set<Complaint.ComplaintStatus>> STRICT_TRANSITIONS = Map.of(
            Complaint.ComplaintStatus.SUBMITTED,
            Set.of(Complaint.ComplaintStatus.UNDER_REVIEW, Complaint.ComplaintStatus.REJECTED),
            Complaint.ComplaintStatus.UNDER_REVIEW,
            Set.of(Complaint.ComplaintStatus.VERIFIED, Complaint.ComplaintStatus.REJECTED),
            Complaint.ComplaintStatus.VERIFIED,
            Set.of(Complaint.ComplaintStatus.ASSIGNED, Complaint.ComplaintStatus.REJECTED),
            Complaint.ComplaintStatus.ASSIGNED, Set.of(Complaint.ComplaintStatus.IN_PROGRESS),
            Complaint.ComplaintStatus.IN_PROGRESS, Set.of(Complaint.ComplaintStatus.RESOLVED),
            Complaint.ComplaintStatus.RESOLVED,
            Set.of(Complaint.ComplaintStatus.CLOSED, Complaint.ComplaintStatus.IN_PROGRESS),
            Complaint.ComplaintStatus.REJECTED, Set.of(Complaint.ComplaintStatus.UNDER_REVIEW),
            Complaint.ComplaintStatus.CLOSED, Set.of(Complaint.ComplaintStatus.REOPENED),
            Complaint.ComplaintStatus.REOPENED,
            Set.of(Complaint.ComplaintStatus.UNDER_REVIEW, Complaint.ComplaintStatus.VERIFIED));

    @Transactional
    public ComplaintDTO.ComplaintResponse createComplaint(Long userId, ComplaintDTO.CreateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != User.UserStatus.ACTIVE) {
            throw new RuntimeException("Your account is " + user.getStatus().name().toLowerCase());
        }

        // Check monthly limit
        LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
        long count = complaintRepository.countUserComplaintsThisMonth(userId, startOfMonth);
        if (count >= maxComplaintsPerMonth) {
            throw new RuntimeException("Monthly complaint limit reached (" + maxComplaintsPerMonth
                    + "). Try again next month.");
        }

        // Generate complaint ID
        String complaintId = "CMPL" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Complaint complaint = Complaint.builder()
                .complaintId(complaintId)
                .user(user)
                .isAnonymous(request.getIsAnonymous() != null && request.getIsAnonymous())
                .issueType(Complaint.IssueType.valueOf(request.getIssueType()))
                .otherTypeText(request.getOtherTypeText())
                .subject(request.getSubject())
                .priority(request.getPriority() != null
                        ? Complaint.Priority.valueOf(request.getPriority())
                        : Complaint.Priority.P2)
                .description(request.getDescription())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();

        // Set location references
        if (request.getStateId() != null)
            complaint.setState(stateRepository.findById(request.getStateId()).orElse(null));
        if (request.getDistrictId() != null)
            complaint.setDistrict(districtRepository.findById(request.getDistrictId()).orElse(null));
        if (request.getMandalId() != null)
            complaint.setMandal(mandalRepository.findById(request.getMandalId()).orElse(null));
        if (request.getVillageId() != null)
            complaint.setVillage(villageRepository.findById(request.getVillageId()).orElse(null));

        complaint = complaintRepository.save(complaint);

        // Save assets
        if (request.getAttachmentUrls() != null) {
            for (String url : request.getAttachmentUrls()) {
                Asset asset = Asset.builder()
                        .complaint(complaint)
                        .user(user)
                        .secureUrl(url)
                        .url(url)
                        .build();
                assetRepository.save(asset);
            }
        }

        // Update user's monthly complaint counter
        String currentMonth = YearMonth.now().toString(); // e.g. "2026-03"
        if (!currentMonth.equals(user.getMonthTracker())) {
            user.setMonthTracker(currentMonth);
            user.setComplaintsThisMonth(1);
        } else {
            user.setComplaintsThisMonth(user.getComplaintsThisMonth() + 1);
        }
        userRepository.save(user);

        // Record initial status history
        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(complaint)
                .fromStatus(null)
                .toStatus(Complaint.ComplaintStatus.SUBMITTED)
                .changedBy("SYSTEM")
                .remarks("Complaint submitted")
                .build());

        // Send confirmation email
        try {
            emailService.sendComplaintConfirmation(user.getEmail(), complaintId, request.getSubject());
        } catch (Exception e) {
            log.warn("Failed to send confirmation email for {}: {}", complaintId, e.getMessage());
        }

        return mapToResponse(complaint);
    }

    public ComplaintDTO.ComplaintPageResponse getUserComplaints(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Complaint> pageResult = complaintRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return mapToPageResponse(pageResult);
    }

    public ComplaintDTO.ComplaintPageResponse getAllComplaints(Integer stateId, Integer districtId,
            Integer mandalId, Integer villageId,
            String priority, String status,
            int page, int size) {
        Specification<Complaint> spec = Specification.where(null);

        if (stateId != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("state").get("id"), stateId));
        if (districtId != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("district").get("id"), districtId));
        if (mandalId != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("mandal").get("id"), mandalId));
        if (villageId != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("village").get("id"), villageId));
        if (priority != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("priority"), Complaint.Priority.valueOf(priority)));
        if (status != null)
            spec = spec.and((root, q, cb) -> cb.equal(root.get("status"), Complaint.ComplaintStatus.valueOf(status)));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Complaint> pageResult = complaintRepository.findAll(spec, pageable);
        return mapToPageResponse(pageResult);
    }

    public List<ComplaintDTO.ComplaintResponse> getHighPriorityComplaints(int limit) {
        List<Complaint> complaints = complaintRepository.findTopHighPriority(PageRequest.of(0, limit));
        return complaints.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public ComplaintDTO.ComplaintResponse getComplaintById(String complaintId) {
        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));
        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintDTO.ComplaintResponse updateStatus(String complaintId, String fromStatus, String toStatus,
            Admin caller, String reason) {
        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Complaint.ComplaintStatus currentStatus = complaint.getStatus();
        Complaint.ComplaintStatus newStatus = Complaint.ComplaintStatus.valueOf(toStatus);

        // Validate concurrent modification
        if (fromStatus != null && !currentStatus.name().equals(fromStatus)) {
            throw new RuntimeException("Concurrent modification: status has already changed");
        }

        // Role-based Access Control
        Admin.AdminRole role = caller.getRole();

        // Enforce strict workflow for non-super admins to prevent mistakes
        if (role != Admin.AdminRole.SUPER_ADMIN) {
            Set<Complaint.ComplaintStatus> allowed = STRICT_TRANSITIONS.getOrDefault(currentStatus, Set.of());
            if (!allowed.contains(newStatus)) {
                throw new RuntimeException("Strict workflow enforced: Cannot transition from " + currentStatus + " to "
                        + newStatus + ". Allowed: " + allowed);
            }
        }
        if (role == Admin.AdminRole.DEPARTMENT_ADMIN) {
            if (newStatus != Complaint.ComplaintStatus.IN_PROGRESS && newStatus != Complaint.ComplaintStatus.RESOLVED) {
                throw new RuntimeException("Department Admins can only update status to In Progress or Resolved.");
            }
            if (!caller.getDepartment().equals(complaint.getAssignedDepartment())) {
                throw new RuntimeException("You can only manage complaints assigned to your department.");
            }
        } else if (role == Admin.AdminRole.GENERAL_ADMIN) {
            if (newStatus == Complaint.ComplaintStatus.CLOSED) {
                throw new RuntimeException("General Admins cannot close complaints directly.");
            }
        } // Super admin and Judicial admin have full override.

        complaint.setStatus(newStatus);
        complaint = complaintRepository.save(complaint);

        // Record status change in status history
        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(complaint)
                .fromStatus(currentStatus)
                .toStatus(newStatus)
                .changedBy(caller.getFullName() + " (" + caller.getRole().name() + ")")
                .remarks(reason)
                .build());

        // Save detailed Audit Log
        adminActionLogRepository.save(AdminActionLog.builder()
                .adminId(caller.getId())
                .adminName(caller.getFullName())
                .adminRole(caller.getRole().name())
                .action("STATUS_CHANGE")
                .complaintId(complaintId)
                .previousStatus(currentStatus.name())
                .newStatus(newStatus.name())
                .reason(reason)
                .build());

        log.info("Complaint {} status changed: {} → {} by {}", complaintId, currentStatus, newStatus,
                caller.getEmail());

        // Send status update email to complaint owner
        try {
            String userEmail = complaint.getUser().getEmail();
            emailService.sendStatusUpdateEmail(userEmail, complaintId, currentStatus.name(), newStatus.name(), reason);
        } catch (Exception e) {
            log.warn("Failed to send status update email for {}: {}", complaintId, e.getMessage());
        }

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintDTO.ComplaintResponse assignComplaint(String complaintId, String department, Long assigneeId,
            Admin caller, String reason) {
        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        if (complaint.getStatus() != Complaint.ComplaintStatus.VERIFIED
                && complaint.getStatus() != Complaint.ComplaintStatus.REOPENED) {
            throw new RuntimeException("Only Verified or Reopened complaints can be assigned.");
        }

        Admin.AdminRole role = caller.getRole();
        if (role == Admin.AdminRole.DEPARTMENT_ADMIN) {
            throw new RuntimeException("Department Admins cannot perform assignments.");
        }

        String oldDept = complaint.getAssignedDepartment();

        // Conflict of Interest minimal routing logic:
        // if the issue type is CORRUPTION and against their own department, escalate to
        // Judicial.
        if (complaint.getIssueType() == Complaint.IssueType.CORRUPTION
                && department.equalsIgnoreCase("Police Department")) {
            department = "Judicial";
            complaint.setEscalationLevel(complaint.getEscalationLevel() + 1);
        }

        complaint.setAssignedDepartment(department);
        complaint.setAssignedAdminId(assigneeId);
        complaint.setStatus(Complaint.ComplaintStatus.ASSIGNED);
        complaint = complaintRepository.save(complaint);

        statusHistoryRepository.save(StatusHistory.builder()
                .complaint(complaint)
                .fromStatus(Complaint.ComplaintStatus.VERIFIED)
                .toStatus(Complaint.ComplaintStatus.ASSIGNED)
                .changedBy(caller.getFullName() + " (" + caller.getRole().name() + ")")
                .remarks("Assigned to " + department + (reason != null ? ". Reason: " + reason : ""))
                .build());

        adminActionLogRepository.save(AdminActionLog.builder()
                .adminId(caller.getId())
                .adminName(caller.getFullName())
                .adminRole(caller.getRole().name())
                .action("ASSIGNMENT")
                .complaintId(complaintId)
                .previousStatus(oldDept)
                .newStatus(department)
                .reason(reason)
                .build());

        return mapToResponse(complaint);
    }

    @Transactional
    public ComplaintDTO.ComplaintResponse updatePriority(String complaintId, String priority, Admin caller,
            String reason) {
        Complaint complaint = complaintRepository.findByComplaintId(complaintId)
                .orElseThrow(() -> new RuntimeException("Complaint not found"));

        Admin.AdminRole role = caller.getRole();
        if (role == Admin.AdminRole.DEPARTMENT_ADMIN) {
            throw new RuntimeException("Department Admins cannot change complaint priority.");
        }

        String oldPriority = complaint.getPriority().name();
        complaint.setPriority(Complaint.Priority.valueOf(priority));
        complaint = complaintRepository.save(complaint);

        adminActionLogRepository.save(AdminActionLog.builder()
                .adminId(caller.getId())
                .adminName(caller.getFullName())
                .adminRole(caller.getRole().name())
                .action("PRIORITY_CHANGE")
                .complaintId(complaintId)
                .previousStatus(oldPriority)
                .newStatus(priority)
                .reason(reason)
                .build());

        return mapToResponse(complaint);
    }

    public ComplaintDTO.DashboardStats getDashboardStats() {
        return ComplaintDTO.DashboardStats.builder()
                .totalComplaints(complaintRepository.countAll())
                .submitted(complaintRepository.countByStatus(Complaint.ComplaintStatus.SUBMITTED))
                .underReview(complaintRepository.countByStatus(Complaint.ComplaintStatus.UNDER_REVIEW))
                .verified(complaintRepository.countByStatus(Complaint.ComplaintStatus.VERIFIED))
                .assigned(complaintRepository.countByStatus(Complaint.ComplaintStatus.ASSIGNED))
                .inProgress(complaintRepository.countByStatus(Complaint.ComplaintStatus.IN_PROGRESS))
                .resolved(complaintRepository.countByStatus(Complaint.ComplaintStatus.RESOLVED))
                .rejected(complaintRepository.countByStatus(Complaint.ComplaintStatus.REJECTED))
                .closed(complaintRepository.countByStatus(Complaint.ComplaintStatus.CLOSED))
                .build();
    }

    private ComplaintDTO.ComplaintResponse mapToResponse(Complaint c) {
        List<Asset> assets = assetRepository.findByComplaintId(c.getId());
        List<ComplaintDTO.AssetResponse> assetResponses = assets.stream()
                .map(a -> ComplaintDTO.AssetResponse.builder()
                        .id(a.getId())
                        .url(a.getUrl())
                        .secureUrl(a.getSecureUrl())
                        .format(a.getFormat())
                        .bytes(a.getBytes())
                        .build())
                .collect(Collectors.toList());

        // Build location string
        StringBuilder locationStr = new StringBuilder();
        if (c.getVillage() != null)
            locationStr.append(c.getVillage().getName());
        if (c.getMandal() != null) {
            if (locationStr.length() > 0)
                locationStr.append(", ");
            locationStr.append(c.getMandal().getName());
        }
        if (c.getDistrict() != null) {
            if (locationStr.length() > 0)
                locationStr.append(", ");
            locationStr.append(c.getDistrict().getName());
        }

        String userName = c.getIsAnonymous() ? "Anonymous"
                : (c.getUser().getFullName() != null
                        ? c.getUser().getFullName()
                        : "Unknown");

        return ComplaintDTO.ComplaintResponse.builder()
                .id(c.getId())
                .complaintId(c.getComplaintId())
                .userName(userName)
                .isAnonymous(c.getIsAnonymous())
                .issueType(c.getIssueType() != null ? c.getIssueType().name() : null)
                .otherTypeText(c.getOtherTypeText())
                .subject(c.getSubject())
                .priority(c.getPriority().name())
                .description(c.getDescription())
                .status(c.getStatus().name())
                .location(locationStr.toString())
                .stateName(c.getState() != null ? c.getState().getName() : null)
                .districtName(c.getDistrict() != null ? c.getDistrict().getName() : null)
                .mandalName(c.getMandal() != null ? c.getMandal().getName() : null)
                .villageName(c.getVillage() != null ? c.getVillage().getName() : null)
                .stateId(c.getState() != null ? c.getState().getId() : null)
                .villageId(c.getVillage() != null ? c.getVillage().getId() : null)
                .latitude(c.getLatitude())
                .longitude(c.getLongitude())

                .attachments(assetResponses)
                .timeline(getTimeline(c))
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }

    private List<ComplaintDTO.StatusTimelineEntry> getTimeline(Complaint c) {
        return statusHistoryRepository.findByComplaintOrderByChangedAtAsc(c)
                .stream()
                .map(h -> ComplaintDTO.StatusTimelineEntry.builder()
                        .fromStatus(h.getFromStatus() != null ? h.getFromStatus().name() : null)
                        .toStatus(h.getToStatus().name())
                        .changedBy(h.getChangedBy())
                        .remarks(h.getRemarks())
                        .changedAt(h.getChangedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private ComplaintDTO.ComplaintPageResponse mapToPageResponse(Page<Complaint> page) {
        return ComplaintDTO.ComplaintPageResponse.builder()
                .complaints(page.getContent().stream()
                        .map(this::mapToResponse)
                        .collect(Collectors.toList()))
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .currentPage(page.getNumber())
                .pageSize(page.getSize())
                .build();
    }

    public List<Map<String, Object>> getUserNotifications(Long userId) {
        List<StatusHistory> history = statusHistoryRepository.findRecentByUserId(userId);
        return history.stream().map(h -> {
            Map<String, Object> n = new java.util.LinkedHashMap<>();
            n.put("complaintId", h.getComplaint().getComplaintId());
            n.put("subject", h.getComplaint().getSubject());
            n.put("fromStatus", h.getFromStatus() != null ? h.getFromStatus().name() : null);
            n.put("toStatus", h.getToStatus().name());
            n.put("changedBy", h.getChangedBy());
            n.put("remarks", h.getRemarks());
            n.put("changedAt", h.getChangedAt());
            return n;
        }).collect(Collectors.toList());
    }
}

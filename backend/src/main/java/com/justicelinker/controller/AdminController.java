package com.justicelinker.controller;

import com.justicelinker.dto.ComplaintDTO;
import com.justicelinker.dto.ProfileDTO;
import com.justicelinker.model.Admin;
import com.justicelinker.model.User;
import com.justicelinker.repository.*;
import com.justicelinker.service.ComplaintService;
import com.justicelinker.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final ComplaintService complaintService;
    private final UserRepository userRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    // ============= COMPLAINT MANAGEMENT =============

    @GetMapping("/complaints")
    public ResponseEntity<?> getAllComplaints(
            @RequestParam(required = false) Integer stateId,
            @RequestParam(required = false) Integer districtId,
            @RequestParam(required = false) Integer mandalId,
            @RequestParam(required = false) Integer villageId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(complaintService.getAllComplaints(
                stateId, districtId, mandalId, villageId, priority, status, page, size));
    }

    @GetMapping("/complaints/high-priority")
    public ResponseEntity<?> getHighPriorityComplaints(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(complaintService.getHighPriorityComplaints(limit));
    }

    @GetMapping("/complaints/{complaintId}")
    public ResponseEntity<?> getComplaint(@PathVariable String complaintId) {
        try {
            return ResponseEntity.ok(complaintService.getComplaintById(complaintId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/complaints/{complaintId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String complaintId,
            @RequestBody ComplaintDTO.UpdateStatusRequest request) {
        try {
            return ResponseEntity.ok(complaintService.updateStatus(
                    complaintId, request.getFromStatus(), request.getToStatus()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/complaints/{complaintId}/priority")
    public ResponseEntity<?> updatePriority(@PathVariable String complaintId,
            @RequestBody ComplaintDTO.UpdatePriorityRequest request) {
        try {
            return ResponseEntity.ok(complaintService.updatePriority(complaintId, request.getPriority()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getDashboardStats() {
        return ResponseEntity.ok(complaintService.getDashboardStats());
    }

    // ============= USER MANAGEMENT =============

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = org.springframework.data.domain.PageRequest.of(page, size);
        var users = userRepository.findAll(pageable);
        var response = users.getContent().stream().map(u -> Map.of(
                "id", u.getId(),
                "fullName", u.getFullName() != null ? u.getFullName() : "",
                "email", u.getEmail(),
                "status", u.getStatus().name(),
                "createdAt", u.getCreatedAt() != null ? u.getCreatedAt().toString() : "")).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of(
                "users", response,
                "totalElements", users.getTotalElements(),
                "totalPages", users.getTotalPages(),
                "currentPage", users.getNumber()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            String newStatusStr = body.get("status");
            User.UserStatus newStatus = User.UserStatus.valueOf(newStatusStr);
            String reason = body.get("reason");

            user.setStatus(newStatus);
            userRepository.save(user);

            // Send email if suspended or terminated
            if ((newStatus == User.UserStatus.SUSPENDED || newStatus == User.UserStatus.TERMINATED) && reason != null
                    && !reason.trim().isEmpty()) {
                emailService.sendAccountStatusEmail(user.getEmail(), newStatusStr, reason);
            }

            return ResponseEntity.ok(Map.of(
                    "message", "User status updated to " + newStatusStr,
                    "userId", userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // ============= ADMIN MANAGEMENT (Super Admin Only) =============

    @GetMapping("/admins")
    public ResponseEntity<?> getAllAdmins(Authentication auth) {
        // Verify caller is SUPER_ADMIN
        Admin caller = adminRepository.findById(Long.parseLong(auth.getName()))
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (caller.getRole() != Admin.AdminRole.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only Super Admin can manage admins"));
        }

        var admins = adminRepository.findAll().stream().map(a -> Map.of(
                "id", a.getId(),
                "fullName", a.getFullName(),
                "email", a.getEmail(),
                "role", a.getRole().name(),
                "department", a.getDepartment() != null ? a.getDepartment() : "General",
                "createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : "")).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("admins", admins));
    }

    @PostMapping("/admins")
    public ResponseEntity<?> createAdmin(@RequestBody Map<String, String> body, Authentication auth) {
        // Verify caller is SUPER_ADMIN
        Admin caller = adminRepository.findById(Long.parseLong(auth.getName()))
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (caller.getRole() != Admin.AdminRole.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only Super Admin can create admins"));
        }

        String fullName = body.get("fullName");
        String email = body.get("email");
        String password = body.get("password");
        String department = body.get("department");

        if (fullName == null || email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full name, email, and password are required"));
        }

        // Strict Password Validation
        String passwordRegex = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!*-]).{8,}$";
        if (!password.matches(passwordRegex)) {
            return ResponseEntity.badRequest().body(Map.of("message",
                    "Password must be at least 8 characters long and contain at least one digit, one uppercase letter, one lowercase letter, and one special character"));
        }

        if (adminRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Admin with this email already exists"));
        }

        Admin newAdmin = adminRepository.save(Admin.builder()
                .fullName(fullName)
                .email(email)
                .password(passwordEncoder.encode(password))
                .role(Admin.AdminRole.ADMIN)
                .department(department != null && !department.trim().isEmpty() ? department : "General")
                .build());

        return ResponseEntity.ok(Map.of(
                "message", "Admin created successfully",
                "adminId", newAdmin.getId(),
                "email", newAdmin.getEmail()));
    }

    @DeleteMapping("/admins/{adminId}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long adminId, Authentication auth) {
        Admin caller = adminRepository.findById(Long.parseLong(auth.getName()))
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (caller.getRole() != Admin.AdminRole.SUPER_ADMIN) {
            return ResponseEntity.status(403).body(Map.of("message", "Only Super Admin can delete admins"));
        }

        Admin target = adminRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        if (target.getRole() == Admin.AdminRole.SUPER_ADMIN) {
            return ResponseEntity.badRequest().body(Map.of("message", "Cannot delete the Super Admin account"));
        }

        adminRepository.delete(target);
        return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));
    }
}

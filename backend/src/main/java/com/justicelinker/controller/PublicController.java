package com.justicelinker.controller;

import com.justicelinker.model.Complaint;
import com.justicelinker.repository.ComplaintRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class PublicController {

        private final ComplaintRepository complaintRepository;

        @GetMapping("/transparency/stats")
        public ResponseEntity<?> getPublicStats() {
                long totalComplaints = complaintRepository.countAll();

                long pending = complaintRepository.countByStatus(Complaint.ComplaintStatus.SUBMITTED) +
                                complaintRepository.countByStatus(Complaint.ComplaintStatus.UNDER_REVIEW) +
                                complaintRepository.countByStatus(Complaint.ComplaintStatus.ASSIGNED) +
                                complaintRepository.countByStatus(Complaint.ComplaintStatus.REOPENED) +
                                complaintRepository.countByStatus(Complaint.ComplaintStatus.VERIFIED) +
                                complaintRepository.countByStatus(Complaint.ComplaintStatus.IN_PROGRESS);

                long resolved = complaintRepository.countByStatus(Complaint.ComplaintStatus.RESOLVED) +
                                complaintRepository.countByStatus(Complaint.ComplaintStatus.CLOSED);

                // Calculate average resolution time dynamically (rough estimation)
                List<Complaint> resolvedComplaints = complaintRepository.findAll().stream()
                                .filter(c -> c.getStatus() == Complaint.ComplaintStatus.RESOLVED
                                                || c.getStatus() == Complaint.ComplaintStatus.CLOSED)
                                .collect(Collectors.toList());

                long totalMinutes = 0;
                for (Complaint c : resolvedComplaints) {
                        totalMinutes += ChronoUnit.MINUTES.between(c.getCreatedAt(), c.getUpdatedAt());
                }

                long avgResolutionHours = resolvedComplaints.isEmpty() ? 0
                                : Math.max(1, totalMinutes / (resolvedComplaints.size() * 60));
                // If it's resolved but took less than an hour, show at least 1 hr to reflect
                // effort,
                // or just use float if we want to be very precise. But user seems to want 1 or
                // 2.
                // Let's use a more accurate avg:
                if (!resolvedComplaints.isEmpty()) {
                        double avg = (double) totalMinutes / (resolvedComplaints.size() * 60.0);
                        avgResolutionHours = Math.max(1, (long) Math.ceil(avg));
                }

                return ResponseEntity.ok(Map.of(
                                "totalComplaints", totalComplaints,
                                "pendingComplaints", pending,
                                "resolvedComplaints", resolved,
                                "avgResolutionHours", avgResolutionHours));
        }
}

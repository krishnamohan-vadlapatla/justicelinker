package com.justicelinker.service;

import com.justicelinker.model.Complaint;
import com.justicelinker.model.StatusHistory;
import com.justicelinker.repository.ComplaintRepository;
import com.justicelinker.repository.StatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class EscalationService {

    private final ComplaintRepository complaintRepository;
    private final StatusHistoryRepository statusHistoryRepository;
    private final EmailService emailService;

    // Run every hour
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void processSlaEscalations() {
        log.info("Starting SLA Escalation check...");

        List<Complaint> activeComplaints = complaintRepository.findByStatusNotIn(
                List.of(Complaint.ComplaintStatus.RESOLVED, Complaint.ComplaintStatus.CLOSED,
                        Complaint.ComplaintStatus.REJECTED));

        int escalatedCount = 0;
        LocalDateTime now = LocalDateTime.now();

        for (Complaint complaint : activeComplaints) {
            long hoursSinceCreation = ChronoUnit.HOURS.between(complaint.getCreatedAt(), now);
            long slaHours = getSlaHours(complaint.getPriority());

            // Check if current age exceeds SLA for its current escalation tier
            int currentTier = complaint.getEscalationLevel() == null ? 0 : complaint.getEscalationLevel();
            long allowedHours = slaHours * (currentTier + 1);

            if (hoursSinceCreation > allowedHours) {
                // Escalate
                complaint.setEscalationLevel(currentTier + 1);

                // Increase priority if possible
                increasePriority(complaint);

                complaintRepository.save(complaint);

                statusHistoryRepository.save(StatusHistory.builder()
                        .complaint(complaint)
                        .fromStatus(complaint.getStatus())
                        .toStatus(complaint.getStatus())
                        .changedBy("SYSTEM - ESCALATION")
                        .remarks("SLA breached (" + hoursSinceCreation + "hrs > " + allowedHours
                                + "hrs). Complaint escalated automatically. Tier: " + (currentTier + 1))
                        .build());

                escalatedCount++;

                // In a real scenario, email Super Admin or specific Dept Admin here.
            }
        }

        log.info("Finished SLA Escalation check. Escalate count: {}", escalatedCount);
    }

    private boolean isTerminalStatus(Complaint.ComplaintStatus status) {
        return status == Complaint.ComplaintStatus.RESOLVED ||
                status == Complaint.ComplaintStatus.CLOSED ||
                status == Complaint.ComplaintStatus.REJECTED;
    }

    private long getSlaHours(Complaint.Priority priority) {
        return switch (priority) {
            case P0 -> 24;
            case P1 -> 48; // Escalating P1 to 48h to maintain gap
            case P2 -> 72; // 3 days
            case P3 -> 168; // 7 days
        };
    }

    private void increasePriority(Complaint complaint) {
        switch (complaint.getPriority()) {
            case P3 -> complaint.setPriority(Complaint.Priority.P2);
            case P2 -> complaint.setPriority(Complaint.Priority.P1);
            case P1 -> complaint.setPriority(Complaint.Priority.P0);
            case P0 -> {
                /* Max priority, do nothing to priority value */ }
        }
    }
}

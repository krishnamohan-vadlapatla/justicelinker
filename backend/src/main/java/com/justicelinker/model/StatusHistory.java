package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "status_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private Complaint.ComplaintStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private Complaint.ComplaintStatus toStatus;

    @Column(name = "changed_by", length = 100)
    private String changedBy; // admin email or "SYSTEM"

    @Column(length = 500)
    private String remarks;

    @Column(name = "changed_at")
    @Builder.Default
    private LocalDateTime changedAt = LocalDateTime.now();
}

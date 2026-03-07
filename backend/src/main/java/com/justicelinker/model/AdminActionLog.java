package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_action_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id", nullable = false)
    private Long adminId;

    @Column(name = "admin_name", length = 100)
    private String adminName;

    @Column(name = "admin_role", length = 50)
    private String adminRole;

    @Column(length = 50)
    private String action;

    @Column(name = "complaint_id", length = 50)
    private String complaintId;

    @Column(name = "previous_status", length = 50)
    private String previousStatus;

    @Column(name = "new_status", length = 50)
    private String newStatus;

    @Column(length = 500)
    private String reason;

    @Column
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();
}

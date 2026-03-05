package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaints")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "complaint_id", unique = true, nullable = false, length = 20)
    private String complaintId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "is_anonymous")
    @Builder.Default
    private Boolean isAnonymous = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "issue_type")
    private IssueType issueType;

    @Column(name = "other_type_text", length = 200)
    private String otherTypeText;

    @Column(nullable = false, length = 200)
    private String subject;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Priority priority = Priority.P2;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "state_id")
    private State state;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "district_id")
    private District district;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mandal_id")
    private Mandal mandal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "village_id")
    private Village village;

    @Column(precision = 10)
    private Double latitude;

    @Column(precision = 11)
    private Double longitude;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public enum IssueType {
        POLICE_MISCONDUCT, GOVT_MISCONDUCT, CORRUPTION_BRIBERY,
        POLITICAL_HARASSMENT, LAND_PROPERTY_DISPUTE, EXTORTION_THREATS,
        LEGAL_DISPUTE, CIVIC_ISSUES, MUNICIPALITY_PANCHAYAT, OTHER
    }

    public enum Priority {
        P0, P1, P2, P3
    }

    public enum ComplaintStatus {
        SUBMITTED, UNDER_REVIEW, VERIFIED, ASSIGNED, IN_PROGRESS, RESOLVED, REJECTED, CLOSED
    }
}

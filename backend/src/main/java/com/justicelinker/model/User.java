package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(length = 6)
    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "complaints_this_month")
    @Builder.Default
    private Integer complaintsThisMonth = 0;

    @Column(name = "month_tracker", length = 7)
    private String monthTracker;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum UserStatus {
        ACTIVE, SUSPENDED, TERMINATED
    }
}

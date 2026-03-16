package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rate_limit_tracker", indexes = {
    @Index(name = "idx_rate_limit_key", columnList = "key", unique = true)
})
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class RateLimitTracker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String key;

    @Column(nullable = false)
    @Builder.Default
    private int requestCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private int failedAttempts = 0;

    @Column
    private LocalDateTime lockedUntil;

    @Column(name = "window_start", nullable = false)
    @Builder.Default
    private LocalDateTime windowStart = LocalDateTime.now();

    @Column(name = "last_failed_attempt")
    private LocalDateTime lastFailedAttempt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

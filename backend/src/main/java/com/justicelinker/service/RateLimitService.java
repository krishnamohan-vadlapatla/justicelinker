package com.justicelinker.service;

import com.justicelinker.model.RateLimitTracker;
import com.justicelinker.repository.RateLimitTrackerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RateLimitService {

    private final RateLimitTrackerRepository repository;

    @Value("${rate-limit.otp.requests-per-hour:5}")
    private int maxRequestsPerHour;

    @Value("${rate-limit.otp.wrong-attempts-max:3}")
    private int maxWrongAttempts;

    @Value("${rate-limit.otp.lockout-duration-minutes:30}")
    private int lockoutDurationMinutes;

    @Value("${rate-limit.otp.failed-attempts-ttl-hours:1}")
    private int failedAttemptsTtlHours;

    @Transactional
    public boolean checkOtpRateLimit(String key) {
        RateLimitTracker tracker = getOrCreateTracker(key);
        
        if (tracker.getWindowStart().plusHours(1).isBefore(LocalDateTime.now())) {
            tracker.setRequestCount(0);
            tracker.setWindowStart(LocalDateTime.now());
        }

        if (tracker.getRequestCount() >= maxRequestsPerHour) {
            log.warn("Rate limit exceeded for key: {}", key);
            return false;
        }

        tracker.setRequestCount(tracker.getRequestCount() + 1);
        repository.save(tracker);
        return true;
    }

    @Transactional
    public int recordFailedAttempt(String key) {
        RateLimitTracker tracker = getOrCreateTracker(key);

        if (tracker.getLastFailedAttempt() != null &&
            tracker.getLastFailedAttempt().plusHours(failedAttemptsTtlHours).isBefore(LocalDateTime.now())) {
            tracker.setFailedAttempts(0);
        }

        tracker.setFailedAttempts(tracker.getFailedAttempts() + 1);
        tracker.setLastFailedAttempt(LocalDateTime.now());
        repository.save(tracker);

        return tracker.getFailedAttempts();
    }

    public int getFailedAttempts(String key) {
        return repository.findByKey(key)
                .map(t -> t.getFailedAttempts())
                .orElse(0);
    }

    @Transactional
    public boolean isLocked(String key) {
        return repository.findByKey(key)
                .map(t -> t.getLockedUntil() != null && 
                         t.getLockedUntil().isAfter(LocalDateTime.now()))
                .orElse(false);
    }

    public long getLockoutRemainingSeconds(String key) {
        return repository.findByKey(key)
                .map(t -> {
                    if (t.getLockedUntil() == null) return 0L;
                    return java.time.Duration.between(LocalDateTime.now(), t.getLockedUntil()).getSeconds();
                })
                .orElse(0L);
    }

    @Transactional
    public void lockAccount(String key) {
        RateLimitTracker tracker = getOrCreateTracker(key);
        tracker.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
        repository.save(tracker);
        log.warn("Account locked: {} for {} minutes", key, lockoutDurationMinutes);
    }

    @Transactional
    public void clearFailedAttempts(String key) {
        repository.findByKey(key).ifPresent(tracker -> {
            tracker.setFailedAttempts(0);
            tracker.setLastFailedAttempt(null);
            repository.save(tracker);
        });
    }

    @Transactional
    public void resetRateLimit(String key) {
        repository.findByKey(key).ifPresent(tracker -> {
            tracker.setRequestCount(0);
            tracker.setFailedAttempts(0);
            tracker.setLockedUntil(null);
            tracker.setWindowStart(LocalDateTime.now());
            repository.save(tracker);
        });
    }

    private RateLimitTracker getOrCreateTracker(String key) {
        return repository.findByKey(key)
                .orElseGet(() -> {
                    RateLimitTracker tracker = RateLimitTracker.builder()
                            .key(key)
                            .requestCount(0)
                            .failedAttempts(0)
                            .windowStart(LocalDateTime.now())
                            .build();
                    return repository.save(tracker);
                });
    }

    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpiredRecords() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(30);
        int deleted = repository.deleteByUpdatedAtBefore(threshold);
        log.info("Cleaned up {} expired rate limit records", deleted);
    }
}

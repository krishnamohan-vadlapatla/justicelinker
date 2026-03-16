package com.justicelinker.repository;

import com.justicelinker.model.RateLimitTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RateLimitTrackerRepository extends JpaRepository<RateLimitTracker, Long> {

    Optional<RateLimitTracker> findByKey(String key);

    @Modifying
    @Query("DELETE FROM RateLimitTracker r WHERE r.updatedAt < :threshold")
    int deleteByUpdatedAtBefore(LocalDateTime threshold);
}

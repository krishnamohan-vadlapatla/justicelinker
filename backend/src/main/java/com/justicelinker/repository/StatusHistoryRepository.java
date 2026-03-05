package com.justicelinker.repository;

import com.justicelinker.model.Complaint;
import com.justicelinker.model.StatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface StatusHistoryRepository extends JpaRepository<StatusHistory, Long> {
    List<StatusHistory> findByComplaintOrderByChangedAtAsc(Complaint complaint);

    List<StatusHistory> findByComplaintComplaintIdOrderByChangedAtAsc(String complaintId);

    @Query("SELECT sh FROM StatusHistory sh WHERE sh.complaint.user.id = :userId ORDER BY sh.changedAt DESC LIMIT 20")
    List<StatusHistory> findRecentByUserId(@Param("userId") Long userId);
}

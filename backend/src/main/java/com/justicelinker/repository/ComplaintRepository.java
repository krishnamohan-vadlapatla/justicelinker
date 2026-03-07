package com.justicelinker.repository;

import com.justicelinker.model.Complaint;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface ComplaintRepository extends JpaRepository<Complaint, Long>,
                JpaSpecificationExecutor<Complaint> {

        Optional<Complaint> findByComplaintId(String complaintId);

        Page<Complaint> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

        @Query("SELECT c FROM Complaint c WHERE c.priority IN ('P0','P1') ORDER BY c.createdAt DESC")
        List<Complaint> findTopHighPriority(Pageable pageable);

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.user.id = :userId AND c.createdAt >= :startOfMonth")
        long countUserComplaintsThisMonth(@Param("userId") Long userId,
                        @Param("startOfMonth") java.time.LocalDateTime startOfMonth);

        @Query("SELECT COUNT(c) FROM Complaint c")
        long countAll();

        @Query("SELECT COUNT(c) FROM Complaint c WHERE c.status = :status")
        long countByStatus(@Param("status") Complaint.ComplaintStatus status);

        List<Complaint> findByStatusNotIn(List<Complaint.ComplaintStatus> statuses);
}

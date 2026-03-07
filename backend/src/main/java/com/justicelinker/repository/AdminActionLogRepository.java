package com.justicelinker.repository;

import com.justicelinker.model.AdminActionLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AdminActionLogRepository extends JpaRepository<AdminActionLog, Long> {
    List<AdminActionLog> findByComplaintIdOrderByTimestampDesc(String complaintId);

    Page<AdminActionLog> findByAdminIdOrderByTimestampDesc(Long adminId, Pageable pageable);
}

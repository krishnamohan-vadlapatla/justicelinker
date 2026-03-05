package com.justicelinker.repository;

import com.justicelinker.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByComplaintId(Long complaintId);

    long countByComplaintId(Long complaintId);
}

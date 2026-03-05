package com.justicelinker.repository;

import com.justicelinker.model.District;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DistrictRepository extends JpaRepository<District, Integer> {
    List<District> findByStateIdOrderByNameAsc(Integer stateId);
}

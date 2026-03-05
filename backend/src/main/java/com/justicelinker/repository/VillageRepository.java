package com.justicelinker.repository;

import com.justicelinker.model.Village;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VillageRepository extends JpaRepository<Village, Integer> {
    List<Village> findByMandalIdOrderByNameAsc(Integer mandalId);
}

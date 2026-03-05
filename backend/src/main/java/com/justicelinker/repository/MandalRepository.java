package com.justicelinker.repository;

import com.justicelinker.model.Mandal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MandalRepository extends JpaRepository<Mandal, Integer> {
    List<Mandal> findByDistrictIdOrderByNameAsc(Integer districtId);
}

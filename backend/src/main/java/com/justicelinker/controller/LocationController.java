package com.justicelinker.controller;

import com.justicelinker.model.*;
import com.justicelinker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final MandalRepository mandalRepository;
    private final VillageRepository villageRepository;

    @GetMapping("/states")
    public ResponseEntity<?> getStates() {
        return ResponseEntity.ok(stateRepository.findAll().stream()
                .map(s -> Map.of("id", s.getId(), "name", s.getName(), "code", s.getCode()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/districts")
    public ResponseEntity<?> getDistricts(@RequestParam Integer stateId) {
        return ResponseEntity.ok(districtRepository.findByStateIdOrderByNameAsc(stateId).stream()
                .map(d -> Map.of("id", d.getId(), "name", d.getName(), "code", d.getCode()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/mandals")
    public ResponseEntity<?> getMandals(@RequestParam Integer districtId) {
        return ResponseEntity.ok(mandalRepository.findByDistrictIdOrderByNameAsc(districtId).stream()
                .map(m -> Map.of("id", m.getId(), "name", m.getName(), "code", m.getCode()))
                .collect(Collectors.toList()));
    }

    @GetMapping("/villages")
    public ResponseEntity<?> getVillages(@RequestParam Integer mandalId) {
        return ResponseEntity.ok(villageRepository.findByMandalIdOrderByNameAsc(mandalId).stream()
                .map(v -> Map.of("id", v.getId(), "name", v.getName(), "code", v.getCode()))
                .collect(Collectors.toList()));
    }
}

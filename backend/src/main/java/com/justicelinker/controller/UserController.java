package com.justicelinker.controller;

import com.justicelinker.dto.ProfileDTO;
import com.justicelinker.model.User;
import com.justicelinker.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final MandalRepository mandalRepository;
    private final VillageRepository villageRepository;

    @PutMapping("/profile")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> updateProfile(Authentication auth,
            @RequestBody ProfileDTO.UpdateRequest request) {
        try {
            Long userId = Long.parseLong(auth.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (request.getFullName() != null)
                user.setFullName(request.getFullName());
            if (request.getStateId() != null)
                user.setState(stateRepository.findById(request.getStateId()).orElse(null));
            if (request.getDistrictId() != null)
                user.setDistrict(districtRepository.findById(request.getDistrictId()).orElse(null));
            if (request.getMandalId() != null)
                user.setMandal(mandalRepository.findById(request.getMandalId()).orElse(null));
            if (request.getVillageId() != null)
                user.setVillage(villageRepository.findById(request.getVillageId()).orElse(null));

            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Profile updated successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}

package com.justicelinker.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.justicelinker.model.*;
import com.justicelinker.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final StateRepository stateRepository;
    private final DistrictRepository districtRepository;
    private final MandalRepository mandalRepository;
    private final VillageRepository villageRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) {
        seedAdmins();
        seedLocations();
    }

    private void seedAdmins() {
        if (adminRepository.count() == 0) {
            // Super Admin
            adminRepository.save(Admin.builder()
                    .fullName("JusticeLinker Admin")
                    .email("admin@justicelinker.in")
                    .password(passwordEncoder.encode("admin@123"))
                    .role(Admin.AdminRole.SUPER_ADMIN)
                    .build());

            // Moderator
            adminRepository.save(Admin.builder()
                    .fullName("Moderator")
                    .email("moderator@justicelinker.in")
                    .password(passwordEncoder.encode("mod@123"))
                    .build());

            // Field Coordinator
            adminRepository.save(Admin.builder()
                    .fullName("Field Coordinator")
                    .email("field@justicelinker.in")
                    .password(passwordEncoder.encode("field@123"))
                    .build());

            log.info("=== Admin Accounts Created ===");
            log.info("1. admin@justicelinker.in / admin@123");
            log.info("2. moderator@justicelinker.in / mod@123");
            log.info("3. field@justicelinker.in / field@123");
            log.info("==============================");
        }
    }

    private void seedLocations() {
        if (stateRepository.count() > 0)
            return;

        try {
            // Seed Andhra Pradesh state
            State ap = stateRepository.save(State.builder().code("28").name("Andhra Pradesh").build());

            // --- Load Districts ---
            List<Map<String, Object>> districtData = loadJson("data/districts.json");
            Map<Integer, District> districtMap = new HashMap<>();
            for (Map<String, Object> d : districtData) {
                int code = ((Number) d.get("code")).intValue();
                String name = (String) d.get("name");
                District district = districtRepository.save(
                        District.builder().code(String.valueOf(code)).name(name).state(ap).build());
                districtMap.put(code, district);
            }
            log.info("Seeded {} districts", districtMap.size());

            // --- Load Mandals ---
            List<Map<String, Object>> mandalData = loadJson("data/mandals.json");
            Map<Integer, Mandal> mandalMap = new HashMap<>();
            for (Map<String, Object> m : mandalData) {
                int code = ((Number) m.get("code")).intValue();
                int districtCode = ((Number) m.get("district_code")).intValue();
                String name = (String) m.get("name");
                District district = districtMap.get(districtCode);
                if (district != null) {
                    Mandal mandal = mandalRepository.save(
                            Mandal.builder().code(String.valueOf(code)).name(name).district(district).build());
                    mandalMap.put(code, mandal);
                }
            }
            log.info("Seeded {} mandals", mandalMap.size());

            // --- Load Villages ---
            List<Map<String, Object>> villageData = loadJson("data/villages.json");
            int villageCount = 0;
            for (Map<String, Object> v : villageData) {
                int code = ((Number) v.get("code")).intValue();
                int mandalCode = ((Number) v.get("mandal_code")).intValue();
                String name = (String) v.get("name");
                Mandal mandal = mandalMap.get(mandalCode);
                if (mandal != null) {
                    villageRepository.save(
                            Village.builder().code(String.valueOf(code)).name(name).mandal(mandal).build());
                    villageCount++;
                }
            }
            log.info("Seeded {} villages", villageCount);
            log.info("=== Location data seeding complete ===");

        } catch (Exception e) {
            log.error("Failed to seed location data", e);
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> loadJson(String path) throws Exception {
        InputStream is = new ClassPathResource(path).getInputStream();
        return objectMapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {
        });
    }
}

package com.justicelinker.service;

import com.justicelinker.dto.AuthDTO;
import com.justicelinker.model.Admin;
import com.justicelinker.model.User;
import com.justicelinker.repository.AdminRepository;
import com.justicelinker.repository.ComplaintRepository;
import com.justicelinker.repository.UserRepository;
import com.justicelinker.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final ComplaintRepository complaintRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.otp-expiry-minutes}")
    private int otpExpiryMinutes;

    @Value("${app.max-complaints-per-month}")
    private int maxComplaintsPerMonth;

    public void sendOtp(String email) {
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(otpExpiryMinutes);

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> User.builder()
                        .email(email)
                        .build());

        user.setOtp(otp);
        user.setOtpExpiry(expiry);
        userRepository.save(user);

        // Send email
        try {
            emailService.sendOtpEmail(email, otp, otpExpiryMinutes);
            log.info("OTP sent to email: {}", email);
        } catch (Exception e) {
            log.warn("Mail sending failed. OTP for {}: {}", email, otp);
        }
    }

    public String verifyOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() == null || !user.getOtp().equals(otp)) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry() != null && user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired, please request a new one");
        }

        if (user.getStatus() == User.UserStatus.SUSPENDED || user.getStatus() == User.UserStatus.TERMINATED) {
            throw new RuntimeException("Your account has been " + user.getStatus().name().toLowerCase()
                    + ". Please contact support.");
        }

        // Clear OTP after successful verification
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);

        return jwtUtil.generateToken(user.getId().toString(), "USER");
    }

    public String adminLogin(String email, String password) {
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(password, admin.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        return jwtUtil.generateToken(admin.getId().toString(), admin.getRole().name());
    }

    public AuthDTO.UserInfoResponse getUserInfo(String userId, String role) {
        if ("USER".equals(role)) {
            User user = userRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new RuntimeException("User not found"));

            LocalDateTime startOfMonth = YearMonth.now().atDay(1).atStartOfDay();
            long complaintsThisMonth = complaintRepository.countUserComplaintsThisMonth(
                    user.getId(), startOfMonth);

            AuthDTO.LocationInfo location = AuthDTO.LocationInfo.builder()
                    .stateId(user.getState() != null ? user.getState().getId() : null)
                    .stateName(user.getState() != null ? user.getState().getName() : null)
                    .districtId(user.getDistrict() != null ? user.getDistrict().getId() : null)
                    .districtName(user.getDistrict() != null ? user.getDistrict().getName() : null)
                    .mandalId(user.getMandal() != null ? user.getMandal().getId() : null)
                    .mandalName(user.getMandal() != null ? user.getMandal().getName() : null)
                    .villageId(user.getVillage() != null ? user.getVillage().getId() : null)
                    .villageName(user.getVillage() != null ? user.getVillage().getName() : null)
                    .build();

            return AuthDTO.UserInfoResponse.builder()
                    .id(user.getId())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .role("USER")
                    .location(location)
                    .complaintsThisMonth((int) complaintsThisMonth)
                    .maxComplaintsPerMonth(maxComplaintsPerMonth)
                    .maxComplaintsExceeded(complaintsThisMonth >= maxComplaintsPerMonth)
                    .build();
        } else {
            Admin admin = adminRepository.findById(Long.parseLong(userId))
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            return AuthDTO.UserInfoResponse.builder()
                    .id(admin.getId())
                    .fullName(admin.getFullName())
                    .email(admin.getEmail())
                    .role(admin.getRole().name())
                    .build();
        }
    }
}

package com.justicelinker.controller;

import com.justicelinker.dto.AuthDTO;
import com.justicelinker.exception.RateLimitException;
import com.justicelinker.service.AuthService;
import com.justicelinker.service.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RateLimitService rateLimitService;

    @Value("${rate-limit.otp.wrong-attempts-max:3}")
    private int maxWrongAttempts;

    private ResponseCookie createJwtCookie(String token) {
        return ResponseCookie.from("jwt", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(Duration.ofHours(24))
                .sameSite("None")
                .build();
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody AuthDTO.SendOtpRequest request,
                                     HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        String key = clientIp + ":" + request.getEmail();

        if (!rateLimitService.checkOtpRateLimit(key)) {
            throw new RateLimitException(
                "Too many OTP requests. Please try again in 30 minutes",
                1800
            );
        }

        try {
            authService.sendOtp(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody AuthDTO.VerifyOtpRequest request,
                                       HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);
        String key = clientIp + ":" + request.getEmail();

        if (rateLimitService.isLocked(key)) {
            long retryAfter = rateLimitService.getLockoutRemainingSeconds(key);
            throw new RateLimitException(
                "Account locked due to too many failed attempts. Try again in 30 minutes",
                retryAfter > 0 ? retryAfter : 1800
            );
        }

        try {
            String token = authService.verifyOtp(request.getEmail(), request.getOtp());
            rateLimitService.clearFailedAttempts(key);
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, createJwtCookie(token).toString())
                    .body(AuthDTO.AuthResponse.builder()
                            .message("Logged in successfully")
                            .role("USER")
                            .build());
        } catch (RuntimeException e) {
            int attempts = rateLimitService.recordFailedAttempt(key);
            int remaining = maxWrongAttempts - attempts;

            if (remaining <= 0) {
                rateLimitService.lockAccount(key);
                throw new RateLimitException(
                    "Account locked due to too many failed attempts. Try again in 30 minutes",
                    1800
                );
            }

            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid OTP. You have " + remaining + " attempts remaining"));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody AuthDTO.AdminLoginRequest request) {
        try {
            String token = authService.adminLogin(request.getEmail(), request.getPassword());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, createJwtCookie(token).toString())
                    .body(AuthDTO.AuthResponse.builder()
                            .message("Logged in successfully")
                            .role("ADMIN")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(Authentication auth) {
        try {
            String userId = auth.getName();
            String role = auth.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .map(a -> a.replace("ROLE_", ""))
                    .orElse("USER");
            return ResponseEntity.ok(authService.getUserInfo(userId, role));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("jwt", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }
}

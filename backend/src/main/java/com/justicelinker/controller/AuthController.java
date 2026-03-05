package com.justicelinker.controller;

import com.justicelinker.dto.AuthDTO;
import com.justicelinker.service.AuthService;
import lombok.RequiredArgsConstructor;
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

    @PostMapping("/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody AuthDTO.SendOtpRequest request) {
        try {
            authService.sendOtp(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + request.getEmail()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody AuthDTO.VerifyOtpRequest request) {
        try {
            String token = authService.verifyOtp(request.getEmail(), request.getOtp());
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false) // Set to true in production
                    .path("/")
                    .maxAge(Duration.ofHours(24))
                    .sameSite("Lax")
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(AuthDTO.AuthResponse.builder()
                            .message("Logged in successfully")
                            .role("USER")
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@RequestBody AuthDTO.AdminLoginRequest request) {
        try {
            String token = authService.adminLogin(request.getEmail(), request.getPassword());
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false)
                    .path("/")
                    .maxAge(Duration.ofHours(24))
                    .sameSite("Lax")
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
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
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of("message", "Logged out successfully"));
    }
}

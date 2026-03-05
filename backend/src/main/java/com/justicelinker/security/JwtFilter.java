package com.justicelinker.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.justicelinker.repository.UserRepository;
import com.justicelinker.model.User;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);

        if (token != null && jwtUtil.isValid(token)) {
            String subject = jwtUtil.getSubject(token);
            String role = jwtUtil.getRole(token);

            if ("USER".equals(role)) {
                // If the user's role is USER, we check their status in the DB
                userRepository.findById(Long.parseLong(subject)).ifPresent(user -> {
                    if (user.getStatus() != User.UserStatus.TERMINATED
                            && user.getStatus() != User.UserStatus.SUSPENDED) {
                        var auth = new UsernamePasswordAuthenticationToken(
                                subject,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                        SecurityContextHolder.getContext().setAuthentication(auth);
                    }
                });
            } else {
                // For ADMIN or SUPER_ADMIN we proceed directly
                var auth = new UsernamePasswordAuthenticationToken(
                        subject,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        // 1. Check cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        // 2. Check Authorization header
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}

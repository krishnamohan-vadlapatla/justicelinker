package com.justicelinker.controller;

import com.justicelinker.dto.ComplaintDTO;
import com.justicelinker.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> createComplaint(Authentication auth,
            @RequestBody ComplaintDTO.CreateRequest request) {
        try {
            Long userId = Long.parseLong(auth.getName());
            ComplaintDTO.ComplaintResponse response = complaintService.createComplaint(userId, request);
            return ResponseEntity.status(201).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyComplaints(Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(complaintService.getUserComplaints(userId, page, size));
    }

    @GetMapping("/{complaintId}")
    public ResponseEntity<?> getComplaint(@PathVariable String complaintId) {
        try {
            return ResponseEntity.ok(complaintService.getComplaintById(complaintId));
        } catch (Exception e) {
            return ResponseEntity.status(404).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/my/notifications")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> getMyNotifications(Authentication auth) {
        Long userId = Long.parseLong(auth.getName());
        return ResponseEntity.ok(complaintService.getUserNotifications(userId));
    }

}

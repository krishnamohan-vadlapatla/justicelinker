package com.justicelinker.controller;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class UploadController {

    private final Cloudinary cloudinary;

    @Value("${app.max-image-size-mb}")
    private int maxImageSizeMb;

    // Accept all common image types including HEIC from iPhones
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp",
            "image/bmp", "image/tiff", "image/svg+xml", "image/heic", "image/heif",
            "image/avif", "image/jfif");

    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "File is empty"));
            }

            // Validate file size
            long maxBytes = (long) maxImageSizeMb * 1024 * 1024;
            if (file.getSize() > maxBytes) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "File size exceeds " + maxImageSizeMb + "MB limit. Please compress or resize the image."));
            }

            // Validate file type — Accept all image types
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message",
                        "Only image files are allowed (JPEG, PNG, GIF, WebP, HEIC, etc.)"));
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "justicelinker/evidence",
                            "resource_type", "image",
                            "transformation", "q_auto,f_auto" // auto quality + format
                    ));

            return ResponseEntity.ok(Map.of(
                    "url", result.get("url"),
                    "secure_url", result.get("secure_url"),
                    "public_id", result.get("public_id"),
                    "format", result.get("format"),
                    "bytes", result.get("bytes")));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}

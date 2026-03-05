package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "cloudinary_public_id", length = 100)
    private String cloudinaryPublicId;

    @Column(length = 500)
    private String url;

    @Column(name = "secure_url", length = 500)
    private String secureUrl;

    @Column(length = 10)
    private String format;

    private Integer bytes;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}

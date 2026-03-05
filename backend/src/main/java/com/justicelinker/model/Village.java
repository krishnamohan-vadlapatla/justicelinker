package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "villages")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Village {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 10)
    private String code;

    @Column(length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mandal_id")
    private Mandal mandal;
}

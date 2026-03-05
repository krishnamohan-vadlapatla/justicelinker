package com.justicelinker.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "states")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class State {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true, length = 10)
    private String code;

    @Column(length = 100)
    private String name;
}

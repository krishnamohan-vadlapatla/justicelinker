package com.justicelinker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class JusticeLinkerApplication {
    public static void main(String[] args) {
        try {
            SpringApplication.run(JusticeLinkerApplication.class, args);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Bean
    public CommandLineRunner runSchemaFix(JdbcTemplate jdbcTemplate) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE complaints MODIFY status VARCHAR(50);");
                System.out.println("==> Successfully altered complaints.status column to VARCHAR(50)");
            } catch (Exception e) {
                System.out.println(
                        "==> Could not alter complaints.status table (might not exist yet): " + e.getMessage());
            }
        };
    }
}

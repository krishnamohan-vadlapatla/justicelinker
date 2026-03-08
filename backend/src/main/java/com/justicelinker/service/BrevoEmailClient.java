package com.justicelinker.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
@Slf4j
public class BrevoEmailClient {

    @Value("${brevo.api-key}")
    private String apiKey;

    private final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendEmail(String fromEmail, String fromName, String to, String subject, String htmlContent) {

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> body = new HashMap<>();

        Map<String, String> sender = new HashMap<>();
        sender.put("email", fromEmail);
        sender.put("name", fromName);

        Map<String, String> recipient = new HashMap<>();
        recipient.put("email", to);

        body.put("sender", sender);
        body.put("to", List.of(recipient));
        body.put("subject", subject);
        body.put("htmlContent", htmlContent);

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        restTemplate.postForEntity(BREVO_URL, request, String.class);

        log.info("Email sent via Brevo to {}", to);
    }
}

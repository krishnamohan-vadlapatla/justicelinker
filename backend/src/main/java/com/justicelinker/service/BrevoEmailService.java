package com.justicelinker.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class BrevoEmailService {

    @Value("${BREVO_API_KEY}")
    private String apiKey;

    private final String BREVO_URL = "https://api.brevo.com/v3/smtp/email";

    public void sendEmail(String to, String subject, String htmlContent) {

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> email = new HashMap<>();

        Map<String, String> sender = new HashMap<>();
        sender.put("name", "JusticeLinker");
        sender.put("email", "justicelinker.noreply@gmail.com");

        Map<String, String> recipient = new HashMap<>();
        recipient.put("email", to);

        email.put("sender", sender);
        email.put("to", List.of(recipient));
        email.put("subject", subject);
        email.put("htmlContent", htmlContent);

        HttpHeaders headers = new HttpHeaders();
        headers.set("api-key", apiKey);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(email, headers);

        restTemplate.postForEntity(BREVO_URL, request, String.class);
    }
}

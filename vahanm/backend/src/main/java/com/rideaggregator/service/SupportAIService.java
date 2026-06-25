package com.rideaggregator.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import com.rideaggregator.repository.SupportTicketRepository;
import com.rideaggregator.model.SupportTicket;
import lombok.RequiredArgsConstructor;

@Slf4j
@Service
@RequiredArgsConstructor
public class SupportAIService {

        @Value("${app.ai.gemini-api-key}")
        private String geminiApiKey;

        private final RestTemplate restTemplate = new RestTemplate();
        private final SupportTicketRepository ticketRepository;

        @jakarta.annotation.PostConstruct
        public void init() {
                log.info("Initializing Support AI Service with Google Gemini...");
                if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("${")) {
                        log.error("CRITICAL: GEMINI_API_KEY is null or not interpolated correctly!");
                } else {
                        log.info("Gemini API Key loaded successfully. Length: {}", geminiApiKey.length());
                }
        }

        public String getChatResponse(String message, String userId) {
                log.info("REQ to Gemini -> Question: {}, UserId: {}", message, userId);

                if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.startsWith("${")) {
                        log.error("Missing Gemini API key configuration.");
                        throw new RuntimeException("AI Core Configuration Error: Missing API Key.");
                }

                String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key="
                                + geminiApiKey;

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);

                // Retrieve RAG Context
                StringBuilder contextBuilder = new StringBuilder();
                if (userId != null && !userId.trim().isEmpty()) {
                        List<SupportTicket> pastTickets = ticketRepository
                                        .findTop5ByUserIdAndStatusOrderByCreatedAtDesc(userId, "resolved");
                        if (pastTickets != null && !pastTickets.isEmpty()) {
                                contextBuilder.append("\n\nPAST SUPPORT RESOLUTIONS:\n");
                                for (int i = 0; i < pastTickets.size(); i++) {
                                        SupportTicket t = pastTickets.get(i);
                                        contextBuilder.append("\nTicket ").append(i + 1).append("\n");
                                        contextBuilder.append("Issue: ")
                                                        .append(t.getDescription() != null ? t.getDescription() : "N/A")
                                                        .append("\n");
                                        contextBuilder.append("Resolution: ")
                                                        .append(t.getAdminReply() != null ? t.getAdminReply() : "N/A")
                                                        .append("\n");
                                }
                        }
                }

                // Build Gemini Request Payload
                // { "contents": [ { "parts": [ { "text": "user question here" } ] } ] }
                String prompt = "You are a helpful customer support agent for Vahanm ride-booking app. Answer politely. If you do not know, state that as well."
                                + contextBuilder.toString()
                                + "\n\nUser Question: " + message;
                Map<String, Object> part = Collections.singletonMap("text", prompt);
                Map<String, Object> content = Collections.singletonMap("parts", Collections.singletonList(part));
                Map<String, Object> requestBody = Collections.singletonMap("contents",
                                Collections.singletonList(content));

                HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

                try {
                        log.info("Sending request to Gemini API. Request Body: {}", requestBody);
                        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
                        Map<String, Object> responseBody = response.getBody();
                        log.info("Raw Gemini Response received: {}", responseBody);

                        if (responseBody == null || !responseBody.containsKey("candidates")) {
                                throw new RuntimeException("Invalid response from Gemini API: " + responseBody);
                        }

                        // Extract the generated text from parsed response map
                        List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseBody
                                        .get("candidates");
                        Map<String, Object> contentMap = (Map<String, Object>) candidates.get(0).get("content");
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) contentMap.get("parts");
                        String text = (String) parts.get(0).get("text");

                        log.info("RES from Gemini -> Answer: {}", text);
                        return text;

                } catch (Exception e) {
                        log.error("Gemini API Call Failed! Error: {}", e.getMessage(), e);
                        throw new RuntimeException("AI API Call Failed: " + e.getMessage(), e);
                }
        }
}

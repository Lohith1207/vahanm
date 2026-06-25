package com.rideaggregator.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import com.rideaggregator.model.SafetyIncident;
import com.rideaggregator.repository.SafetyIncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.annotation.PostConstruct;

@Service
public class SafetyService {

    @Autowired
    private SafetyIncidentRepository safetyIncidentRepository;

    @Value("${app.openai.api-key}")
    private String openAiKey;

    private ChatLanguageModel chatModel;

    @PostConstruct
    public void init() {
        if (openAiKey != null && !openAiKey.isEmpty() && !openAiKey.contains("dummy")) {
            this.chatModel = OpenAiChatModel.builder()
                    .apiKey(openAiKey)
                    .modelName("gpt-4-turbo-preview") // Or whatever the Python backend used
                    .build();
        }
    }

    public String analyzeIncident(String description) {
        if (chatModel == null) {
            return "AI analysis disabled. Please configure a valid OPENAI_API_KEY.";
        }

        String prompt = "You are a safety assistant for a ride aggregator app. Analyze the following incident report and provide a brief assessment of severity and recommended actions:\n\n"
                + description;
        return chatModel.generate(prompt);
    }

    public SafetyIncident reportIncident(String userId, String role, SafetyIncident incident) {
        incident.setReportedBy(userId);
        incident.setRole(role);

        if (incident.getStatus() == null || incident.getStatus().isEmpty()) {
            incident.setStatus("REPORTED");
        }

        if (incident.getSeverity() == null || incident.getSeverity().isEmpty()) {
            incident.setSeverity("medium");
        }

        incident.setCreatedAt(LocalDateTime.now());
        incident.setUpdatedAt(LocalDateTime.now());

        // Optional: Trigger AI analysis asynchronously here

        return safetyIncidentRepository.save(incident);
    }

    public List<SafetyIncident> getUserIncidents(String userId) {
        return safetyIncidentRepository.findByReportedBy(userId);
    }
}

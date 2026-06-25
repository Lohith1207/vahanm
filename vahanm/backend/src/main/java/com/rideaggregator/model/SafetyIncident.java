package com.rideaggregator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "safety_incidents")
public class SafetyIncident {
    @Id
    private String id;

    private String rideId;
    private String reportedBy; // user ID
    private String role; // "customer", "driver"

    private String incidentType;
    private String description;
    private String location;
    private String severity; // "low", "medium", "high", "critical"
    private String status; // "open", "investigating", "resolved"

    // AI analysis stored in DB
    private String aiAnalysis;
    private Double confidenceScore;

    private String resolutionNotes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

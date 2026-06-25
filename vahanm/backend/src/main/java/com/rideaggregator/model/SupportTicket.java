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
@Document(collection = "support_tickets")
public class SupportTicket {
    @Id
    private String id;

    private String userId;
    private String role; // "customer", "driver"
    private String rideId; // Optional

    private String subject;
    private String category; // "billing", "app_issue", "driver_behavior", "other"
    private String description;
    private String status; // "open", "in_progress", "resolved", "closed"

    private String adminReply;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

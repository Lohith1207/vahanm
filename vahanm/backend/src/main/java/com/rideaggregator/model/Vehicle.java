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
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "vehicles")
public class Vehicle {
    @Id
    private String id;
    
    private String driverId;

    private String make;
    private String model;
    private String year;
    private String licensePlate;
    private String color;
    private String type; // "Ride", "Premium", "Bike", "Courier"

    private boolean isVerified;
    
    // For documents stored in this vehicle
    private List<VehicleDocument> documents;

    @CreatedDate
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VehicleDocument {
        private String id;
        private String type; // "insurance", "registration", "inspection"
        private String fileUrl;
        private boolean isVerified;
        private LocalDateTime uploadedAt;
    }
}

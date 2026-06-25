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
@Document(collection = "rides")
public class Ride {
    @Id
    private String id;

    private String customerId;
    private String driverId;

    private String pickupLocation;
    private double pickupLat;
    private double pickupLng;

    private String dropLocation;
    private double dropLat;
    private double dropLng;

    private String status; // "requested", "accepted", "in_progress", "completed", "cancelled"

    private String vehicleType; // "Ride", "Premium", "Bike", "Courier"
    
    private double estimatedFare;
    private double finalFare;
    private double distanceKm;
    
    private String otp; // Used for secure ride start

    private String cancellationReason;
    private String cancelledBy; // "customer", "driver"

    private Integer rating;
    private String feedback;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

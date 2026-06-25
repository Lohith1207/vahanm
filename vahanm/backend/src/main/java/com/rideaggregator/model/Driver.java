package com.rideaggregator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "drivers")
public class Driver {
    @Id
    private String id;

    private String name;

    private String phone;

    @Indexed(unique = true)
    @jakarta.validation.constraints.Email
    @jakarta.validation.constraints.NotBlank
    private String email;

    @com.fasterxml.jackson.annotation.JsonIgnore
    private String password;

    @Builder.Default
    private String role = "driver";

    private String drivingLicense;

    private String vehicleNumber;

    private String vehicleType;

    @Builder.Default
    private Double currentLat = 0.0;

    @Builder.Default
    private Double currentLng = 0.0;

    @Builder.Default
    private boolean isActive = true;

    @Builder.Default
    private boolean isVerified = false;

    @Builder.Default
    private double walletBalance = 0.0;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

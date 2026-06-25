package com.rideaggregator.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "payments")
public class Payment {
    @Id
    private String id;

    private String userId;
    private double amount;
    private String currency;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String status; // PENDING, SUCCESS, FAILED

    @CreatedDate
    private LocalDateTime createdAt;
}

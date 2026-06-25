package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.dto.payment.PaymentOrderRequest;
import com.rideaggregator.dto.payment.PaymentVerifyRequest;
import com.rideaggregator.model.Payment;
import com.rideaggregator.security.services.UserDetailsImpl;
import com.rideaggregator.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-order")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrder(
            Authentication authentication,
            @RequestBody PaymentOrderRequest request) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Map<String, Object> orderData = paymentService.createOrder(userDetails.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Order created successfully", orderData));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create order: " + e.getMessage()));
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPayment(
            Authentication authentication,
            @RequestBody PaymentVerifyRequest request) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            Map<String, Object> result = paymentService.verifyPayment(userDetails.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Payment verified successfully", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Payment verification failed: " + e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<Payment>>> getPaymentHistory(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Payment> history = paymentService.getPaymentHistory(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Payment history retrieved", history));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to get history: " + e.getMessage()));
        }
    }
}

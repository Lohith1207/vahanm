package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.model.Ride;
import com.rideaggregator.model.User;
import com.rideaggregator.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = { "/api/v1/customer", "/api/v1" })
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<User>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", customerService.getCustomerProfile()));
    }

    @PostMapping("/rides")
    public ResponseEntity<ApiResponse<Ride>> requestRide(@RequestBody Ride ride) {
        Ride newRide = customerService.createRide(ride);
        return ResponseEntity.ok(ApiResponse.success("Ride requested successfully", newRide));
    }

    @GetMapping("/rides")
    public ResponseEntity<ApiResponse<List<Ride>>> getRecentRides(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Recent rides retrieved", customerService.getRecentRides(limit)));
    }

    @GetMapping("/rides/{id}")
    public ResponseEntity<ApiResponse<Ride>> getRideInfo(@PathVariable String id) {
        if ("current".equals(id)) {
            // Fetch the most recent active ride
            List<Ride> rides = customerService.getRecentRides(1);
            Ride currentRide = rides.isEmpty() ? null : rides.get(0);
            return ResponseEntity.ok(ApiResponse.success("Current ride retrieved", currentRide));
        }
        return ResponseEntity.ok(ApiResponse.success("Ride info retrieved", customerService.getRideById(id)));
    }

    @PostMapping("/rides/{id}/cancel")
    public ResponseEntity<ApiResponse<Ride>> cancelRide(
            @PathVariable String id,
            @RequestBody(required = false) Ride cancelRequest) {
        String reason = (cancelRequest != null && cancelRequest.getCancellationReason() != null)
                ? cancelRequest.getCancellationReason()
                : "No reason provided";
        return ResponseEntity.ok(ApiResponse.success("Ride cancelled", customerService.cancelRide(id, reason)));
    }

    @PostMapping("/rides/{id}/rate")
    public ResponseEntity<ApiResponse<Ride>> rateRide(
            @PathVariable String id,
            @RequestBody Ride ratingRequest) {
        int rating = ratingRequest.getRating() != null ? ratingRequest.getRating() : 5;
        String feedback = ratingRequest.getFeedback();
        return ResponseEntity
                .ok(ApiResponse.success("Ride rated successfully", customerService.rateRide(id, rating, feedback)));
    }
}

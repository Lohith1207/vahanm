package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.model.Driver;
import com.rideaggregator.model.Ride;
import com.rideaggregator.service.CustomerService;
import com.rideaggregator.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;

@RestController
public class AppRideController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private DriverService driverService;

    // 1. DRIVER AVAILABILITY
    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/api/v1/drivers/status")
    public ResponseEntity<ApiResponse<Driver>> updateDriverStatus(@RequestBody Map<String, Object> payload) {
        boolean isOnline = (Boolean) payload.getOrDefault("isOnline", false);
        Double lat = payload.containsKey("currentLat") ? Double.valueOf(payload.get("currentLat").toString()) : null;
        Double lng = payload.containsKey("currentLng") ? Double.valueOf(payload.get("currentLng").toString()) : null;
        return ResponseEntity.ok(ApiResponse.success("Status updated", driverService.updateStatus(isOnline, lat, lng)));
    }

    // 2. CUSTOMER SEARCH FOR DRIVERS (AND CRERATES DB ENTRY)
    @PreAuthorize("hasRole('CUSTOMER')")
    @PostMapping("/api/v1/rides/request")
    public ResponseEntity<ApiResponse<Ride>> searchDrivers(@RequestBody Map<String, Object> payload) {
        return ResponseEntity.ok(
                ApiResponse.success("Ride requested successfully", customerService.requestRide(payload)));
    }

    // 4. DRIVER RECEIVES RIDE REQUEST
    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/api/v1/rides/pending")
    public ResponseEntity<ApiResponse<List<Ride>>> getPendingRides() {
        return ResponseEntity.ok(ApiResponse.success("Pending rides retrieved", driverService.getPendingRides()));
    }

    // 5. DRIVER ACCEPT RIDE
    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/api/v1/rides/accept/{rideId}")
    public ResponseEntity<ApiResponse<Ride>> acceptRide(@PathVariable String rideId) {
        return ResponseEntity.ok(ApiResponse.success("Ride accepted", driverService.acceptRide(rideId)));
    }

    // 6. CUSTOMER STATUS UPDATE
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/api/v1/rides/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<Ride>>> getCustomerActiveRides(@PathVariable String customerId) {
        return ResponseEntity
                .ok(ApiResponse.success("Active rides retrieved", customerService.getCustomerActiveRides(customerId)));
    }

    // 7. RIDE COMPLETION
    @PreAuthorize("hasRole('DRIVER')")
    @PutMapping("/api/v1/rides/complete/{rideId}")
    public ResponseEntity<ApiResponse<Ride>> completeRide(@PathVariable String rideId) {
        return ResponseEntity.ok(ApiResponse.success("Ride completed", driverService.completeRide(rideId)));
    }

    // 8. CUSTOMER HISTORY
    @PreAuthorize("hasRole('CUSTOMER')")
    @GetMapping("/api/v1/rides/history/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<Ride>>> getCustomerRideHistory(@PathVariable String customerId) {
        return ResponseEntity
                .ok(ApiResponse.success("Customer ride history", customerService.getCustomerRideHistory(customerId)));
    }

    // 8. DRIVER HISTORY
    @PreAuthorize("hasRole('DRIVER')")
    @GetMapping("/api/v1/rides/history/driver/{driverId}")
    public ResponseEntity<ApiResponse<List<Ride>>> getDriverRideHistory(@PathVariable String driverId) {
        return ResponseEntity
                .ok(ApiResponse.success("Driver ride history", driverService.getDriverRideHistory(driverId)));
    }

    @Autowired
    private com.rideaggregator.repository.RideRepository rideRepository;

    @GetMapping("/api/v1/public/clear-stale")
    public ResponseEntity<ApiResponse<String>> clearStaleRides() {
        rideRepository.deleteAll(rideRepository.findByStatus("REQUESTED"));
        return ResponseEntity.ok(ApiResponse.success("Stale rides cleared", "Done"));
    }
}

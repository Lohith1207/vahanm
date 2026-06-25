package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.model.Ride;
import com.rideaggregator.model.Driver;
import com.rideaggregator.model.Vehicle;
import com.rideaggregator.service.DriverService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/driver")
@PreAuthorize("hasRole('DRIVER')")
public class DriverController {

    @Autowired
    private DriverService driverService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<Driver>> getProfile() {
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved", driverService.getDriverProfile()));
    }

    @PutMapping("/status")
    public ResponseEntity<ApiResponse<Driver>> updateStatus(
            @RequestParam boolean is_online,
            @RequestParam(required = false, defaultValue = "0.0") Double lat,
            @RequestParam(required = false, defaultValue = "0.0") Double lng) {
        return ResponseEntity
                .ok(ApiResponse.success("Status updated", driverService.updateStatus(is_online, lat, lng)));
    }

    @GetMapping("/rides/available")
    public ResponseEntity<ApiResponse<List<Ride>>> getAvailableRides(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "10.0") double radius) {
        return ResponseEntity.ok(
                ApiResponse.success("Available rides retrieved", driverService.getAvailableRides(lat, lng, radius)));
    }

    @PostMapping("/rides/{id}/accept")
    public ResponseEntity<ApiResponse<Ride>> acceptRide(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Ride accepted", driverService.acceptRide(id)));
    }

    @PostMapping("/rides/{id}/start")
    public ResponseEntity<ApiResponse<Ride>> startRide(
            @PathVariable String id,
            @RequestParam String otp) {
        return ResponseEntity.ok(ApiResponse.success("Ride started", driverService.startRide(id, otp)));
    }

    @PostMapping("/rides/{id}/complete")
    public ResponseEntity<ApiResponse<Ride>> completeRide(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success("Ride completed", driverService.completeRide(id)));
    }

    @PostMapping("/rides/{id}/cancel")
    public ResponseEntity<ApiResponse<Ride>> cancelRide(
            @PathVariable String id,
            @RequestBody(required = false) Ride cancelRequest) {
        String reason = (cancelRequest != null && cancelRequest.getCancellationReason() != null)
                ? cancelRequest.getCancellationReason()
                : "Driver cancelled";
        return ResponseEntity.ok(ApiResponse.success("Ride cancelled", driverService.cancelRide(id, reason)));
    }

    @GetMapping("/rides/history")
    public ResponseEntity<ApiResponse<List<Ride>>> getRideHistory(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success("Ride history retrieved", driverService.getRecentRides(limit)));
    }

    @PostMapping("/vehicles")
    public ResponseEntity<ApiResponse<Vehicle>> addVehicle(@RequestBody Vehicle vehicle) {
        return ResponseEntity.ok(ApiResponse.success("Vehicle added", driverService.addVehicle(vehicle)));
    }

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getVehicles() {
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved", driverService.getVehicles()));
    }
}

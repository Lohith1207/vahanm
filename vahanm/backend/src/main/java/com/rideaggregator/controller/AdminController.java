package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.model.User;
import com.rideaggregator.model.Ride;
import com.rideaggregator.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/analytics/overview")
    public ResponseEntity<Map<String, Object>> getAnalyticsOverview(@RequestParam(defaultValue = "7") int days) {
        Map<String, Object> data = adminService.getAnalyticsOverview(days);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/analytics/summary")
    public ResponseEntity<Map<String, Object>> getAnalyticsSummary(@RequestParam(defaultValue = "7") int days) {
        Map<String, Object> data = adminService.getAnalyticsSummary(days);
        return ResponseEntity.ok(data);
    }

    @PostMapping("/analytics/ask")
    public ResponseEntity<Map<String, Object>> askAnalyticsAI(@RequestBody Map<String, Object> request) {
        String question = (String) request.getOrDefault("question", "");
        int days = (int) request.getOrDefault("days", 7);
        Map<String, Object> data = adminService.askAnalyticsAI(question, days);
        return ResponseEntity.ok(data);
    }

    @GetMapping("/monitor/live")
    public ResponseEntity<Map<String, Object>> getLiveMonitorData() {
        Map<String, Object> data = adminService.getLiveMonitorData();
        return ResponseEntity.ok(data);
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(@RequestParam(required = false) String role) {
        Map<String, Object> response = adminService.getUsersPaginated(role);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rides")
    public ResponseEntity<Map<String, Object>> getAllRides() {
        List<Ride> rides = adminService.getAllRides();
        return ResponseEntity.ok(Map.of("rides", rides, "total", rides.size()));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable String userId,
            @RequestParam boolean is_active) {
        User updatedUser = adminService.updateUserStatus(userId, is_active);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/drivers/verification")
    public ResponseEntity<Map<String, Object>> getDriversForVerification(@RequestParam(defaultValue = "all") String status) {
        Map<String, Object> data = adminService.getDriversForVerification(status);
        return ResponseEntity.ok(data);
    }

    @PutMapping("/drivers/{driverId}/verify")
    public ResponseEntity<ApiResponse<User>> verifyDriver(
            @PathVariable String driverId,
            @RequestParam boolean is_verified,
            @RequestParam(required = false) String rejection_reason) {
        User driver = adminService.verifyDriver(driverId, is_verified);
        return ResponseEntity.ok(ApiResponse.success("Driver verification updated", driver));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }
}

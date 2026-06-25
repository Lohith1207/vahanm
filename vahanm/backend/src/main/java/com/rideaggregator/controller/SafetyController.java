package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.service.SafetyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import com.rideaggregator.model.SafetyIncident;
import com.rideaggregator.security.services.UserDetailsImpl;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/safety")
@PreAuthorize("hasAnyRole('CUSTOMER', 'DRIVER', 'ADMIN')")
public class SafetyController {

    @Autowired
    private SafetyService safetyService;

    @PostMapping("/analyze")
    public ResponseEntity<ApiResponse<String>> analyzeIncident(@RequestBody Map<String, String> payload) {
        String description = payload.get("description");
        if (description == null || description.isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Description is required"));
        }

        String result = safetyService.analyzeIncident(description);
        return ResponseEntity.ok(ApiResponse.success("Incident analyzed", result));
    }

    @PostMapping("/report")
    public ResponseEntity<ApiResponse<SafetyIncident>> reportIncident(
            Authentication authentication,
            @RequestBody SafetyIncident incidentPayload) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        SafetyIncident createdIncident = safetyService.reportIncident(userDetails.getId(), "customer", incidentPayload);
        return ResponseEntity.ok(ApiResponse.success("Safety incident reported successfully", createdIncident));
    }

    @GetMapping("/my-reports")
    public ResponseEntity<ApiResponse<List<SafetyIncident>>> getMyReports(
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<SafetyIncident> reports = safetyService.getUserIncidents(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Reports retrieved successfully", reports));
    }
}

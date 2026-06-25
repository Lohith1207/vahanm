package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.dto.auth.JwtResponse;
import com.rideaggregator.dto.auth.LoginRequest;
import com.rideaggregator.dto.auth.SignupRequest;
import com.rideaggregator.dto.auth.DriverSignupRequest;
import com.rideaggregator.model.User;
import com.rideaggregator.model.Driver;
import com.rideaggregator.service.AuthService;
import com.rideaggregator.service.DriverService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private DriverService driverService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success("User logged in successfully", jwtResponse));
    }

    @PostMapping("/signup/customer")
    public ResponseEntity<ApiResponse<User>> registerCustomer(@Valid @RequestBody SignupRequest signUpRequest) {
        signUpRequest.setRole("customer");
        User user = authService.registerUser(signUpRequest);
        return ResponseEntity.ok(ApiResponse.success("Customer registered successfully", user));
    }

    @PostMapping("/signup/driver")
    public ResponseEntity<ApiResponse<Driver>> registerDriver(@Valid @RequestBody DriverSignupRequest signUpRequest) {
        Driver driver = driverService.registerDriver(signUpRequest);
        return ResponseEntity.ok(ApiResponse.success("Driver registered successfully", driver));
    }
}

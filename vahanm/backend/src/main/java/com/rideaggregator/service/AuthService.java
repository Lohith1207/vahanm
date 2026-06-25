package com.rideaggregator.service;

import com.rideaggregator.dto.auth.JwtResponse;
import com.rideaggregator.dto.auth.LoginRequest;
import com.rideaggregator.dto.auth.SignupRequest;

import com.rideaggregator.model.User;

import com.rideaggregator.repository.UserRepository;
import com.rideaggregator.repository.DriverRepository;
import com.rideaggregator.security.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    DriverRepository driverRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        Object userObj = driverRepository.findByEmail(loginRequest.getEmail())
                .map(driver -> (Object) driver)
                .orElseGet(() -> userRepository.findByEmail(loginRequest.getEmail())
                        .orElseThrow(() -> new IllegalArgumentException("User not found")));

        return new JwtResponse(jwt, userObj);
    }

    public User registerUser(SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email address is already in use!");
        }

        // Create new user's account
        User user = User.builder()
                .name(signUpRequest.getName())
                .phone(signUpRequest.getPhone())
                .email(signUpRequest.getEmail())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role(signUpRequest.getRole() != null ? signUpRequest.getRole().toLowerCase() : "customer")
                .isActive(true)
                .isVerified(signUpRequest.getRole() == null || signUpRequest.getRole().equalsIgnoreCase("customer"))
                .build();

        return userRepository.save(user);
    }
}

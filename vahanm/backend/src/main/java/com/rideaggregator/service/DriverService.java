package com.rideaggregator.service;

import com.rideaggregator.exception.ResourceNotFoundException;
import com.rideaggregator.model.Ride;
import com.rideaggregator.model.Driver;
import com.rideaggregator.model.Vehicle;
import com.rideaggregator.repository.RideRepository;

import com.rideaggregator.repository.DriverRepository;
import com.rideaggregator.repository.VehicleRepository;
import com.rideaggregator.dto.auth.DriverSignupRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private VehicleRepository vehicleRepository;

    public Driver getDriverProfile() {
        return getCurrentDriver();
    }

    public Driver registerDriver(DriverSignupRequest signUpRequest) {
        if (driverRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email address is already in use!");
        }

        Driver driver = Driver.builder()
                .name(signUpRequest.getName())
                .email(signUpRequest.getEmail())
                .phone(signUpRequest.getPhone())
                .password(encoder.encode(signUpRequest.getPassword()))
                .role("driver")
                .drivingLicense(signUpRequest.getDrivingLicense())
                .vehicleNumber(signUpRequest.getVehicleNumber())
                .vehicleType(signUpRequest.getVehicleType())
                .isActive(true)
                .isVerified(false)
                .build();

        return driverRepository.save(driver);
    }

    public List<Ride> getAvailableRides(double lat, double lng, double radius) {
        // Simple bounding box for demonstration
        double latOffset = radius / 111.0;
        double lngOffset = radius / (111.0 * Math.cos(Math.toRadians(lat)));

        return rideRepository.findAvailableRidesNearby(
                lat - latOffset, lat + latOffset,
                lng - lngOffset, lng + lngOffset);
    }

    public Ride acceptRide(String id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!"REQUESTED".equalsIgnoreCase(ride.getStatus())) {
            throw new IllegalArgumentException("Ride is no longer available");
        }

        ride.setDriverId(getCurrentDriver().getId());
        ride.setStatus("ACCEPTED");
        ride.setOtp(String.format("%04d", (int) (Math.random() * 10000))); // Generate rand OTP
        return rideRepository.save(ride);
    }

    public Ride startRide(String id, String otp) {
        Ride ride = getRideById(id);

        if (!"ACCEPTED".equalsIgnoreCase(ride.getStatus())) {
            throw new IllegalArgumentException("Can only start accepted rides");
        }

        if (ride.getOtp() == null || !ride.getOtp().equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP provided");
        }

        ride.setStatus("IN_PROGRESS");
        return rideRepository.save(ride);
    }

    public Ride completeRide(String id) {
        Ride ride = getRideById(id);
        if (!"IN_PROGRESS".equalsIgnoreCase(ride.getStatus()) && !"ACCEPTED".equalsIgnoreCase(ride.getStatus())) {
            throw new IllegalArgumentException("Can only complete active rides");
        }
        ride.setStatus("COMPLETED");
        ride.setFinalFare(ride.getEstimatedFare()); // Simple pass-through for fare
        return rideRepository.save(ride);
    }

    public Ride cancelRide(String id, String reason) {
        Ride ride = getRideById(id);

        if (!"ACCEPTED".equalsIgnoreCase(ride.getStatus())) {
            throw new IllegalArgumentException("Cannot cancel ride at this stage");
        }

        // Return ride to pool
        ride.setDriverId(null);
        ride.setStatus("REQUESTED");
        ride.setOtp(null);
        return rideRepository.save(ride);
    }

    public List<Ride> getRecentRides(int limit) {
        return rideRepository.findByDriverIdOrderByCreatedAtDesc(
                getCurrentDriver().getId(),
                PageRequest.of(0, limit));
    }

    public Vehicle addVehicle(Vehicle vehicle) {
        vehicle.setDriverId(getCurrentDriver().getId());
        vehicle.setVerified(false);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehicles() {
        return vehicleRepository.findByDriverId(getCurrentDriver().getId());
    }

    public Driver updateStatus(boolean isOnline, Double lat, Double lng) {
        Driver driver = getCurrentDriver();
        driver.setActive(isOnline);
        if (lat != null && lng != null) {
            driver.setCurrentLat(lat);
            driver.setCurrentLng(lng);
        }
        return driverRepository.save(driver);
    }

    public List<Ride> getPendingRides() {
        return rideRepository.findByStatus("REQUESTED");
    }

    public List<Ride> getDriverRideHistory(String driverId) {
        // Find rides by driverId, ordered by created_at desc
        return rideRepository.findByDriverIdOrderByCreatedAtDesc(driverId, PageRequest.of(0, 50));
    }

    private Ride getRideById(String id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!getCurrentDriver().getId().equals(ride.getDriverId())) {
            throw new IllegalArgumentException("Unauthorized to modify this ride");
        }
        return ride;
    }

    private Driver getCurrentDriver() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return driverRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        }
        throw new IllegalStateException("Not authenticated");
    }
}

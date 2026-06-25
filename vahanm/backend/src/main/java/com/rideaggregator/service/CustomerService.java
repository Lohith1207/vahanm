package com.rideaggregator.service;

import com.rideaggregator.exception.ResourceNotFoundException;
import com.rideaggregator.model.Ride;
import com.rideaggregator.model.User;
import com.rideaggregator.repository.RideRepository;
import com.rideaggregator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class CustomerService {

    @Autowired
    private com.rideaggregator.repository.DriverRepository driverRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    public User getCustomerProfile() {
        return getCurrentUser();
    }

    public Ride createRide(Ride ride) {
        User currentUser = getCurrentUser();
        ride.setCustomerId(currentUser.getId());
        ride.setStatus("REQUESTED");
        // Simple fare estimation logic for local dev
        ride.setEstimatedFare(Math.max(50.0, ride.getDistanceKm() * 12.5));
        return rideRepository.save(ride);
    }

    public Ride requestRide(java.util.Map<String, Object> payload) {
        User currentUser = getCurrentUser();

        Ride ride = new Ride();
        ride.setCustomerId(currentUser.getId());
        ride.setStatus("REQUESTED");

        if (payload.containsKey("pickup_location")) {
            Object pickupObj = payload.get("pickup_location");
            if (pickupObj instanceof java.util.Map) {
                java.util.Map<String, Object> pickupLoc = (java.util.Map<String, Object>) pickupObj;
                ride.setPickupLocation(pickupLoc.get("address") != null ? pickupLoc.get("address").toString() : "");
                ride.setPickupLat(
                        pickupLoc.get("latitude") != null ? Double.parseDouble(pickupLoc.get("latitude").toString())
                                : 0.0);
                ride.setPickupLng(
                        pickupLoc.get("longitude") != null ? Double.parseDouble(pickupLoc.get("longitude").toString())
                                : 0.0);
            }
        } else if (payload.containsKey("pickupLocation")) {
            Object pickupObj = payload.get("pickupLocation");
            if (pickupObj instanceof String) {
                ride.setPickupLocation(pickupObj.toString());
            }
        }

        if (payload.containsKey("dropoff_location")) {
            Object dropObj = payload.get("dropoff_location");
            if (dropObj instanceof java.util.Map) {
                java.util.Map<String, Object> dropLoc = (java.util.Map<String, Object>) dropObj;
                ride.setDropLocation(dropLoc.get("address") != null ? dropLoc.get("address").toString() : "");
                ride.setDropLat(
                        dropLoc.get("latitude") != null ? Double.parseDouble(dropLoc.get("latitude").toString()) : 0.0);
                ride.setDropLng(
                        dropLoc.get("longitude") != null ? Double.parseDouble(dropLoc.get("longitude").toString())
                                : 0.0);
            }
        } else if (payload.containsKey("dropLocation")) {
            Object dropObj = payload.get("dropLocation");
            if (dropObj instanceof String) {
                ride.setDropLocation(dropObj.toString());
            }
        }

        if (payload.containsKey("ride_type")) {
            ride.setVehicleType(payload.get("ride_type").toString());
        } else if (payload.containsKey("rideType")) {
            ride.setVehicleType(payload.get("rideType").toString());
        }

        if (payload.containsKey("distance_km")) {
            ride.setDistanceKm(Double.parseDouble(payload.get("distance_km").toString()));
        }

        // Fare logic
        if (payload.containsKey("estimated_fare")) {
            ride.setEstimatedFare(Double.parseDouble(payload.get("estimated_fare").toString()));
        } else if (payload.containsKey("fare")) {
            ride.setEstimatedFare(Double.parseDouble(payload.get("fare").toString()));
        } else {
            ride.setEstimatedFare(Math.max(50.0, ride.getDistanceKm() * 12.5));
        }

        return rideRepository.save(ride);
    }

    public List<Ride> getRecentRides(int limit) {
        User currentUser = getCurrentUser();
        return rideRepository.findByCustomerIdOrderByCreatedAtDesc(
                currentUser.getId(),
                PageRequest.of(0, limit));
    }

    public Ride getRideById(String id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found"));

        if (!ride.getCustomerId().equals(getCurrentUser().getId())) {
            throw new IllegalArgumentException("Unauthorized to view this ride");
        }
        return ride;
    }

    public Ride cancelRide(String id, String reason) {
        Ride ride = getRideById(id);

        if (!ride.getStatus().equalsIgnoreCase("REQUESTED") && !ride.getStatus().equalsIgnoreCase("ACCEPTED")) {
            throw new IllegalArgumentException("Ride cannot be cancelled in status: " + ride.getStatus());
        }

        ride.setStatus("CANCELLED");
        ride.setCancellationReason(reason);
        ride.setCancelledBy("customer");
        return rideRepository.save(ride);
    }

    public Ride rateRide(String id, int rating, String feedback) {
        Ride ride = getRideById(id);
        if (!ride.getStatus().equalsIgnoreCase("COMPLETED")) {
            throw new IllegalArgumentException("Only completed rides can be rated");
        }
        ride.setRating(rating);
        ride.setFeedback(feedback);
        return rideRepository.save(ride);
    }

    private User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetails) {
            String email = ((UserDetails) principal).getUsername();
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        }
        throw new IllegalStateException("Not authenticated");
    }

    public List<com.rideaggregator.model.Driver> findNearbyOnlineDrivers(Double lat, Double lng) {
        double radius = 10.0; // 10km radius
        double latOffset = radius / 111.0;
        double lngOffset = radius / (111.0 * Math.cos(Math.toRadians(lat)));
        return driverRepository.findByIsActiveTrueAndCurrentLatBetweenAndCurrentLngBetween(
                lat - latOffset, lat + latOffset,
                lng - lngOffset, lng + lngOffset);
    }

    public List<Ride> getCustomerActiveRides(String customerId) {
        return rideRepository.findByCustomerIdAndStatusInOrderByCreatedAtDesc(
                customerId, Arrays.asList("REQUESTED", "ACCEPTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"));
    }

    public List<Ride> getCustomerRideHistory(String customerId) {
        return rideRepository.findByCustomerIdOrderByCreatedAtDesc(customerId, PageRequest.of(0, 50));
    }
}

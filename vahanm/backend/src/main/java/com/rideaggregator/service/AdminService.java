package com.rideaggregator.service;

import com.rideaggregator.exception.ResourceNotFoundException;
import com.rideaggregator.model.User;
import com.rideaggregator.model.Ride;
import com.rideaggregator.repository.RideRepository;

import com.rideaggregator.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    public List<Ride> getAllRides() {
        List<Ride> rides = rideRepository.findAll();
        System.out.println("[ADMIN-DEBUG] Admin fetch all rides API called. Found: " + rides.size() + " rides.");
        return rides;
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("total_users", userRepository.count());
        stats.put("total_rides", rideRepository.count());
        stats.put("active_rides", rideRepository.countByStatus("IN_PROGRESS"));

        long recentRides = rideRepository.countByCreatedAtAfter(LocalDateTime.now().minusDays(1));
        stats.put("rides_today", recentRides);

        stats.put("total_revenue", getEstimatedRevenue());

        return stats;
    }

    public Map<String, Object> getAnalyticsOverview(int days) {
        Map<String, Object> response = new HashMap<>();

        Map<String, Object> kpi = new HashMap<>();
        kpi.put("total_revenue", getEstimatedRevenue());
        kpi.put("total_rides", rideRepository.count());
        kpi.put("active_users", userRepository.count());
        kpi.put("avg_wait_time", 12);
        kpi.put("revenue_change", 5.2);
        kpi.put("rides_change", 3.1);
        response.put("kpi", kpi);

        response.put("revenue_trend", List.of());
        response.put("hourly_data", List.of());
        response.put("ride_type_data", List.of());
        response.put("driver_performance", List.of());
        response.put("user_growth_data", List.of());

        Map<String, Object> summary = new HashMap<>();
        summary.put("completion_rate", 85);
        summary.put("avg_distance", 5.4);
        summary.put("avg_fare", 120);
        response.put("summary", summary);

        return response;
    }

    public Map<String, Object> getAnalyticsSummary(int days) {
        Map<String, Object> response = new HashMap<>();
        response.put("summary", "Analytics look steady for the last " + days + " days. Revenue is stable.");
        return response;
    }

    public Map<String, Object> askAnalyticsAI(String question, int days) {
        Map<String, Object> response = new HashMap<>();
        response.put("answer", "This is an AI summary for your question: " + question);
        return response;
    }

    public Map<String, Object> getLiveMonitorData() {
        Map<String, Object> data = new HashMap<>();

        // Fetch rides by status
        data.put("active_rides", rideRepository.findByStatus("IN_PROGRESS"));
        data.put("completed_rides", rideRepository.findByStatus("COMPLETED"));
        data.put("cancelled_rides", rideRepository.findByStatus("CANCELLED"));
        data.put("stats", getDashboardStats());

        return data;
    }

    public List<User> getUsers(String role) {
        if (role != null && !role.isEmpty()) {
            return userRepository.findByRole(role);
        }
        return userRepository.findAll();
    }

    public Map<String, Object> getUsersPaginated(String role) {
        List<User> userList = getUsers(role);
        Map<String, Object> response = new HashMap<>();
        if ("driver".equals(role)) {
            response.put("drivers", userList);
        } else {
            response.put("users", userList);
        }
        response.put("total", userList.size());
        return response;
    }

    public Map<String, Object> getDriversForVerification(String status) {
        List<User> drivers = userRepository.findByRole("driver");
        Map<String, Object> response = new HashMap<>();
        response.put("drivers", drivers);
        response.put("total", drivers.size());
        return response;
    }

    public User updateUserStatus(String userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setActive(isActive);
        return userRepository.save(user);
    }

    public User verifyDriver(String driverId, boolean isVerified) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
        if (!"driver".equals(driver.getRole())) {
            throw new IllegalArgumentException("User is not a driver");
        }
        driver.setVerified(isVerified);
        return userRepository.save(driver);
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    private double getEstimatedRevenue() {
        // Very basic mock calculation; ideally fetch from DB aggregation
        return rideRepository.count() * 10.5; // Avg 10.5 per ride
    }
}

package com.rideaggregator.repository;

import com.rideaggregator.model.Ride;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RideRepository extends MongoRepository<Ride, String> {
    List<Ride> findByCustomerIdOrderByCreatedAtDesc(String customerId, Pageable pageable);

    List<Ride> findByCustomerIdAndStatusInOrderByCreatedAtDesc(String customerId, List<String> statuses);

    List<Ride> findByDriverIdOrderByCreatedAtDesc(String driverId, Pageable pageable);

    List<Ride> findByStatus(String status);

    // Geographical query for available rides nearby - Basic Example
    // Usually uses proper GeoJSON with nearSphere but keeping it simple based on
    // python backend matching
    @Query("{ 'status': 'REQUESTED', 'pickupLat': { $gt: ?0, $lt: ?1 }, 'pickupLng': { $gt: ?2, $lt: ?3 } }")
    List<Ride> findAvailableRidesNearby(double minLat, double maxLat, double minLng, double maxLng);

    long countByCreatedAtAfter(LocalDateTime date);

    long countByStatus(String status);
}

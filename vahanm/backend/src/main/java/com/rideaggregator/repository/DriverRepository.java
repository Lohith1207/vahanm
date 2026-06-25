package com.rideaggregator.repository;

import com.rideaggregator.model.Driver;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DriverRepository extends MongoRepository<Driver, String> {
    Optional<Driver> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<Driver> findByIsActiveTrueAndCurrentLatBetweenAndCurrentLngBetween(
            double minLat, double maxLat, double minLng, double maxLng);
}

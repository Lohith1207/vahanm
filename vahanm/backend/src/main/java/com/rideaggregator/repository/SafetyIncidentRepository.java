package com.rideaggregator.repository;

import com.rideaggregator.model.SafetyIncident;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SafetyIncidentRepository extends MongoRepository<SafetyIncident, String> {
    List<SafetyIncident> findByReportedBy(String reportedBy);
    List<SafetyIncident> findBySeverityAndStatus(String severity, String status);
    List<SafetyIncident> findByStatus(String status);
}

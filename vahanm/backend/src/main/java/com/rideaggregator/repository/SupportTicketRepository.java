package com.rideaggregator.repository;

import com.rideaggregator.model.SupportTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {
    List<SupportTicket> findByUserId(String userId);

    List<SupportTicket> findByStatus(String status);

    List<SupportTicket> findTop5ByUserIdAndStatusOrderByCreatedAtDesc(String userId, String status);
}

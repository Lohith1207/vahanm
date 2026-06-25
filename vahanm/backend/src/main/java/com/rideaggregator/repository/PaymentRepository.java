package com.rideaggregator.repository;

import com.rideaggregator.model.Payment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByUserIdOrderByCreatedAtDesc(String userId);

    Payment findByRazorpayOrderId(String razorpayOrderId);
}

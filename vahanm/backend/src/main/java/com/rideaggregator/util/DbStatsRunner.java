package com.rideaggregator.util;

import com.rideaggregator.repository.RideRepository;
import com.rideaggregator.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DbStatsRunner implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DbStatsRunner.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Override
    public void run(String... args) throws Exception {
        // Replaces the db_stats.py script
        logger.info("======= ON STARTUP DB STATS =======");
        logger.info("Total Users: {}", userRepository.count());
        logger.info("Total Customers: {}", userRepository.findByRole("customer").size());
        logger.info("Total Drivers: {}", userRepository.findByRole("driver").size());
        logger.info("Total Admins: {}", userRepository.findByRole("admin").size());
        logger.info("Total Rides: {}", rideRepository.count());
        logger.info("===================================");
    }
}

package com.rideaggregator;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

@SpringBootApplication
@EnableMongoAuditing
public class RideAggregatorApplication {
    public static void main(String[] args) {
        SpringApplication.run(RideAggregatorApplication.class, args);
    }
}

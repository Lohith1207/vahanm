package com.rideaggregator.security.services;

import com.rideaggregator.model.User;
import com.rideaggregator.model.Driver;
import com.rideaggregator.repository.UserRepository;
import com.rideaggregator.repository.DriverRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DriverRepository driverRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Try finding as Driver first for prioritized driver access
        java.util.Optional<Driver> driverOptional = driverRepository.findByEmail(username);
        if (driverOptional.isPresent()) {
            return UserDetailsImpl.build(driverOptional.get());
        }

        // Try finding as User if not Driver
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found with email: " + username));

        return UserDetailsImpl.build(user);
    }
}

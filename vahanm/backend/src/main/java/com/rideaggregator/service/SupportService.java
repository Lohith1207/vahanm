package com.rideaggregator.service;

import com.rideaggregator.model.SupportTicket;
import com.rideaggregator.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class SupportService {

    @Autowired
    private SupportTicketRepository supportTicketRepository;

    public SupportTicket createTicket(String userId, String role, SupportTicket ticketRequest) {
        SupportTicket ticket = SupportTicket.builder()
                .userId(userId)
                .role(role)
                .subject(ticketRequest.getSubject())
                .category(ticketRequest.getCategory())
                .description(ticketRequest.getDescription())
                .status("open")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return supportTicketRepository.save(ticket);
    }

    public List<SupportTicket> getUserTickets(String userId) {
        return supportTicketRepository.findByUserId(userId);
    }

    public Optional<SupportTicket> getTicketById(String id) {
        return supportTicketRepository.findById(id);
    }
}

package com.rideaggregator.controller;

import com.rideaggregator.dto.ApiResponse;
import com.rideaggregator.model.SupportTicket;
import com.rideaggregator.security.services.UserDetailsImpl;
import com.rideaggregator.service.SupportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = { "/api/v1/customer/support", "/api/v1/support" })
@PreAuthorize("hasRole('CUSTOMER')")
public class SupportController {

    @Autowired
    private SupportService supportService;

    @PostMapping(value = { "/tickets", "/ticket" })
    public ResponseEntity<ApiResponse<SupportTicket>> createTicket(
            Authentication authentication,
            @RequestBody SupportTicket ticketRequest) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        SupportTicket createdTicket = supportService.createTicket(userDetails.getId(), "customer", ticketRequest);
        return ResponseEntity.ok(ApiResponse.success("Support ticket created successfully", createdTicket));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getUserTickets(
            Authentication authentication) {
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        List<SupportTicket> tickets = supportService.getUserTickets(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved successfully", tickets));
    }

    @GetMapping("/tickets/user/{userId}")
    public ResponseEntity<ApiResponse<List<SupportTicket>>> getUserTicketsById(
            @PathVariable String userId) {
        List<SupportTicket> tickets = supportService.getUserTickets(userId);
        return ResponseEntity.ok(ApiResponse.success("Tickets retrieved successfully", tickets));
    }

    @GetMapping("/tickets/{id}")
    public ResponseEntity<ApiResponse<SupportTicket>> getTicketById(
            @PathVariable String id) {
        SupportTicket ticket = supportService.getTicketById(id).orElse(null);
        if (ticket == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Ticket not found"));
        }
        return ResponseEntity.ok(ApiResponse.success("Ticket retrieved successfully", ticket));
    }
}

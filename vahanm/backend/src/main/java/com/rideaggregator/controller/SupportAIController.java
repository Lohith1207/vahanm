package com.rideaggregator.controller;

import com.rideaggregator.service.SupportAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/customer/support/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174" }, maxAge = 3600)
public class SupportAIController {

    private final SupportAIService supportAIService;
    private final com.rideaggregator.repository.SupportTicketRepository ticketRepo;

    @GetMapping("/seed/{userId}")
    public ResponseEntity<?> seed(@PathVariable String userId) {
        com.rideaggregator.model.SupportTicket ticket = new com.rideaggregator.model.SupportTicket();
        ticket.setUserId(userId);
        ticket.setStatus("resolved");
        ticket.setSubject("Lost Item in Cab");
        ticket.setCategory("lost_item");
        ticket.setDescription("Where do I find my lost item?");
        ticket.setAdminReply(
                "To recover a lost item, please visit our main office at 123 Vahanm Street or call driver support.");
        ticketRepo.save(ticket);
        return ResponseEntity.ok(Map.of("message", "Seeded resolved ticket"));
    }

    @PostMapping
    public ResponseEntity<?> handleChatRequest(@RequestBody Map<String, String> payload) {
        String message = payload.get("message");
        String userId = payload.get("userId");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("response", "Message cannot be empty"));
        }

        try {
            System.out.println("====== AI SUPPORT CHAT ======");
            System.out.println("USER: " + message);
            String response = supportAIService.getChatResponse(message, userId);
            System.out.println("AI: " + response);
            System.out.println("=============================");
            return ResponseEntity.ok(Map.of("response", response));
        } catch (Exception e) {
            System.err.println("====== AI SUPPORT ERROR ======");
            System.err.println("Error details: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("response",
                    "AI Error: " + e.getMessage()));
        }
    }
}

package com.DA2.Repparton.Controller;

import com.DA2.Repparton.DTO.ConversationDTO;
import com.DA2.Repparton.Entity.Conversation;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Service.MessageService;
import com.DA2.Repparton.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private UserService userService;

    @PostMapping("/send")
    public ResponseEntity<?> sendMessage(@RequestParam String receiverId,
                                        @RequestParam String content,
                                        Authentication auth) {
        try {
            // Get current user from authentication
            String senderEmail = auth.getName();
            User sender = userService.findByEmail(senderEmail);
            
            if (sender == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            // Check if sender is ARTIST (case insensitive)
            if (!"ARTIST".equalsIgnoreCase(sender.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only artists can send messages"
                ));
            }
            
            // Get receiver and check if they are ARTIST
            User receiver = userService.findById(receiverId);
            if (receiver == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Receiver not found"
                ));
            }
            
            if (!"ARTIST".equalsIgnoreCase(receiver.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Can only send messages to artists"
                ));
            }
            
            // Send message
            var message = messageService.sendMessage(sender.getId(), receiverId, content);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Message sent successfully",
                "data", message
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/conversation")
    public ResponseEntity<?> getConversation(@RequestParam String receiverId,
                                            Authentication auth) {
        try {
            String senderEmail = auth.getName();
            User sender = userService.findByEmail(senderEmail);
            
            if (sender == null || !"ARTIST".equalsIgnoreCase(sender.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only artists can access conversations"
                ));
            }
            
            var conversation = messageService.getOrCreateConversation(sender.getId(), receiverId);
            var messages = messageService.getMessages(conversation.getId());
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", messages
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/conversation/{convId}")
    public ResponseEntity<?> getMessages(@PathVariable String convId,
                                        Authentication auth) {
        try {
            String userEmail = auth.getName();
            User user = userService.findByEmail(userEmail);
            
            if (user == null || !"ARTIST".equalsIgnoreCase(user.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only artists can access messages"
                ));
            }
            
            var messages = messageService.getMessages(convId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", messages
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/conversations")
    public ResponseEntity<?> getConversations(Authentication auth) {
        try {
            System.out.println("=== DEBUG getConversations ===");
            System.out.println("Auth: " + auth);
            System.out.println("Auth name: " + (auth != null ? auth.getName() : "null"));
            
            String userEmail = auth.getName();
            User user = userService.findByEmail(userEmail);
            
            System.out.println("User found: " + (user != null));
            System.out.println("User role: " + (user != null ? user.getRole() : "null"));
            
            if (user == null || !"ARTIST".equalsIgnoreCase(user.getRole())) {
                System.out.println("Access denied - not an artist");
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only artists can access conversations"
                ));
            }
            
            List<ConversationDTO> conversations = messageService.getConversationByUserId(user.getId());
            System.out.println("Found " + conversations.size() + " conversations");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", conversations
            ));
        } catch (Exception e) {
            System.out.println("Error in getConversations: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startConversation(@RequestParam String receiverId,
                                              Authentication auth) {
        try {
            String senderEmail = auth.getName();
            User sender = userService.findByEmail(senderEmail);
            
            if (sender == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "User not found"
                ));
            }
            
            // Check if sender is ARTIST (case insensitive)
            if (!"ARTIST".equalsIgnoreCase(sender.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Only artists can start conversations"
                ));
            }
            
            // Get receiver and check if they are ARTIST
            User receiver = userService.findById(receiverId);
            if (receiver == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Receiver not found"
                ));
            }
            
            if (!"ARTIST".equalsIgnoreCase(receiver.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Can only start conversations with artists"
                ));
            }
            
            // Get or create conversation
            var conversation = messageService.getOrCreateConversation(sender.getId(), receiverId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Conversation ready",
                "data", conversation
            ));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }
}


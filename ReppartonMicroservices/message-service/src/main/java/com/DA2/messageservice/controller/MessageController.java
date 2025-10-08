package com.DA2.messageservice.controller;

import com.DA2.messageservice.entity.Conversation;
import com.DA2.messageservice.entity.DuoMessage;
import com.DA2.messageservice.dto.ConversationDTO;
import com.DA2.messageservice.dto.MessageRequest;
import com.DA2.messageservice.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*")
public class MessageController {

    @Autowired
    private MessageService messageService;

    // Send a message
    @PostMapping("/send")
    public ResponseEntity<DuoMessage> sendMessage(@RequestBody MessageRequest request) {
        try {
            DuoMessage message = messageService.sendMessage(
                request.getSenderId(),
                request.getReceiverId(),
                request.getContent()
            );
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get or create conversation between two users
    @GetMapping("/conversation")
    public ResponseEntity<Conversation> getConversation(
            @RequestParam String user1Id,
            @RequestParam String user2Id) {
        try {
            Conversation conversation = messageService.getOrCreateConversation(user1Id, user2Id);
            return ResponseEntity.ok(conversation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get messages in a conversation
    @GetMapping("/conversation/{conversationId}")
    public ResponseEntity<List<DuoMessage>> getMessages(@PathVariable String conversationId) {
        try {
            List<DuoMessage> messages = messageService.getMessages(conversationId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get user's conversations
    @GetMapping("/user/{userId}/conversations")
    public ResponseEntity<List<ConversationDTO>> getUserConversations(@PathVariable String userId) {
        try {
            List<ConversationDTO> conversations = messageService.getUserConversations(userId);
            return ResponseEntity.ok(conversations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mark message as read
    @PutMapping("/{messageId}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable String messageId) {
        try {
            messageService.markAsRead(messageId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Mark all messages in conversation as read
    @PutMapping("/conversation/{conversationId}/read")
    public ResponseEntity<Void> markConversationAsRead(
            @PathVariable String conversationId,
            @RequestParam String userId) {
        try {
            messageService.markConversationAsRead(conversationId, userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get unread message count
    @GetMapping("/conversation/{conversationId}/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @PathVariable String conversationId,
            @RequestParam String userId) {
        try {
            long count = messageService.getUnreadCount(conversationId, userId);
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Get all unread messages for user
    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<DuoMessage>> getUnreadMessages(@PathVariable String userId) {
        try {
            List<DuoMessage> messages = messageService.getUnreadMessages(userId);
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // Delete conversation
    @DeleteMapping("/conversation/{conversationId}")
    public ResponseEntity<Void> deleteConversation(@PathVariable String conversationId) {
        try {
            messageService.deleteConversation(conversationId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
package com.DA2.messageservice.service;

import com.DA2.messageservice.client.UserServiceClient;
import com.DA2.messageservice.entity.Conversation;
import com.DA2.messageservice.entity.DuoMessage;
import com.DA2.messageservice.dto.ConversationDTO;
import com.DA2.messageservice.dto.UserDTO;
import com.DA2.messageservice.repository.ConversationRepository;
import com.DA2.messageservice.repository.DuoMessageRepository;
import com.DA2.messageservice.websocket.MessageWebSocketPublisher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;

@Service
public class MessageService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private DuoMessageRepository messageRepository;

    @Autowired(required = false)
    private MessageWebSocketPublisher webSocketPublisher;

    @Autowired(required = false)
    private UserServiceClient userServiceClient;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8086/api/notifications}")
    private String notificationServiceUrl;

    // Get or create conversation
    @Transactional
    public Conversation getOrCreateConversation(String user1Id, String user2Id) {
        Optional<Conversation> existingConv = conversationRepository.findByUsers(user1Id, user2Id);
        
        if (existingConv.isPresent()) {
            return existingConv.get();
        }

        // Enforce permission for creating a *new* conversation.
        // Existing conversations are still returned so users can read history.
        if (!canSendMessage(user1Id, user2Id)) {
            throw new RuntimeException("You cannot start a direct conversation with this user.");
        }
        
        // Create new conversation
        Conversation newConversation = new Conversation(user1Id, user2Id);
        return conversationRepository.save(newConversation);
    }

    // Send message
    @Transactional
    public DuoMessage sendMessage(String senderId, String receiverId, String content) {
        // Check if sender can message the receiver
        if (!canSendMessage(senderId, receiverId)) {
            throw new RuntimeException("You cannot send direct messages to this artist. Please use group chat instead.");
        }
        
        // Get or create conversation
        Conversation conversation = getOrCreateConversation(senderId, receiverId);
        
        // Update last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        // Create and save message
        DuoMessage message = new DuoMessage(conversation.getId(), senderId, receiverId, content);
        DuoMessage saved = messageRepository.save(message);

        // Push real-time event to receiver (best-effort)
        if (webSocketPublisher != null) {
            HashMap<String, Object> payload = new HashMap<>();
            payload.put("type", "message");
            payload.put("id", saved.getId());
            payload.put("conversationId", saved.getConversationId());
            payload.put("senderId", saved.getSenderId());
            payload.put("receiverId", saved.getReceiverId());
            payload.put("content", saved.getMessage());
            payload.put("timestamp", saved.getSentAt());
            webSocketPublisher.sendToUser(receiverId, payload);
        }

        // Create bell notification via notification-service (best-effort)
        if (receiverId != null && !receiverId.isBlank() && senderId != null && !senderId.equals(receiverId)) {
            sendNotification(
                    receiverId,
                    senderId,
                    "message",
                    "New message",
                    "New message from user " + senderId,
                    saved.getConversationId()
            );
        }

        return saved;
    }

    private void sendNotification(String recipientId, String actorId, String type, String title, String message, String referenceId) {
        try {
            if (recipientId == null || recipientId.isBlank()) return;
            Map<String, Object> body = new HashMap<>();
            body.put("userId", recipientId);
            body.put("actorId", actorId);
            body.put("type", type);
            body.put("title", title);
            body.put("message", message);
            body.put("referenceId", referenceId);
            restTemplate.postForObject(notificationServiceUrl, body, Object.class);
        } catch (Exception ignored) {
            // best-effort
        }
    }
    
    // Check if user can send direct message to another user
    private boolean canSendMessage(String senderId, String receiverId) {
        try {
            if (userServiceClient != null) {
                // Get sender and receiver info
                UserDTO sender = userServiceClient.getUserById(senderId);
                UserDTO receiver = userServiceClient.getUserById(receiverId);
                
                // If receiver is an Artist
                if ("ARTIST".equalsIgnoreCase(receiver.getRole())) {
                    // Check if artist allows normal user messages
                    // If sender is also an artist, allow
                    if ("ARTIST".equalsIgnoreCase(sender.getRole())) {
                        return true;
                    }
                    // If sender is normal user, check artist's settings
                    // Default: Artists don't allow normal user DMs (allowNormalUserMessages = false)
                    return receiver.isAllowNormalUserMessages();
                }
                
                // If receiver is not an artist, allow (normal user to normal user)
                return true;
            }
        } catch (Exception e) {
            System.err.println("Error checking message permissions: " + e.getMessage());
            // If user service is unavailable, default to blocking
            return false;
        }
        return true; // Fallback: allow if service not available
    }

    // Get messages in conversation
    public List<DuoMessage> getMessages(String conversationId) {
        return messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
    }

    // Get user's conversations
    public List<ConversationDTO> getUserConversations(String userId) {
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        List<ConversationDTO> result = new ArrayList<>();
        
        for (Conversation conv : conversations) {
            try {
                UserDTO user1 = getUserInfo(conv.getUser1Id());
                UserDTO user2 = getUserInfo(conv.getUser2Id());

                DuoMessage last = null;
                try {
                    last = messageRepository.findFirstByConversationIdOrderBySentAtDesc(conv.getId());
                } catch (Exception ignored) {
                    // best-effort
                }

                String lastText = last != null ? last.getMessage() : null;
                LocalDateTime lastAt = last != null && last.getSentAt() != null ? last.getSentAt() : conv.getLastMessageAt();
                long unreadCount = 0L;
                try {
                    unreadCount = messageRepository.countByConversationIdAndIsReadFalseAndReceiverId(conv.getId(), userId);
                } catch (Exception ignored) {
                    // best-effort
                }

                result.add(new ConversationDTO(conv.getId(), user1, user2, lastText, lastAt, unreadCount));
            } catch (Exception e) {
                // If user service is unavailable, create basic DTOs
                UserDTO user1 = new UserDTO(conv.getUser1Id(), "Unknown", "Unknown", null);
                UserDTO user2 = new UserDTO(conv.getUser2Id(), "Unknown", "Unknown", null);

                DuoMessage last = null;
                try {
                    last = messageRepository.findFirstByConversationIdOrderBySentAtDesc(conv.getId());
                } catch (Exception ignored) {
                    // best-effort
                }
                String lastText = last != null ? last.getMessage() : null;
                LocalDateTime lastAt = last != null && last.getSentAt() != null ? last.getSentAt() : conv.getLastMessageAt();
                long unreadCount = 0L;
                try {
                    unreadCount = messageRepository.countByConversationIdAndIsReadFalseAndReceiverId(conv.getId(), userId);
                } catch (Exception ignored) {
                    // best-effort
                }

                result.add(new ConversationDTO(conv.getId(), user1, user2, lastText, lastAt, unreadCount));
            }
        }
        
        return result;
    }

    // Mark message as read
    @Transactional
    public void markAsRead(String messageId) {
        Optional<DuoMessage> messageOpt = messageRepository.findById(messageId);
        if (messageOpt.isPresent()) {
            DuoMessage message = messageOpt.get();
            message.setRead(true);
            messageRepository.save(message);
        }
    }

    // Mark all messages in conversation as read
    @Transactional
    public void markConversationAsRead(String conversationId, String userId) {
        List<DuoMessage> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        for (DuoMessage message : messages) {
            if (message.getReceiverId().equals(userId) && !message.isRead()) {
                message.setRead(true);
                messageRepository.save(message);
            }
        }
    }

    // Get unread message count
    public long getUnreadCount(String conversationId, String userId) {
        return messageRepository.countByConversationIdAndIsReadFalseAndReceiverId(conversationId, userId);
    }

    // Get all unread messages for user
    public List<DuoMessage> getUnreadMessages(String userId) {
        return messageRepository.findByReceiverIdAndIsReadFalse(userId);
    }

    // Delete conversation
    @Transactional
    public void deleteConversation(String conversationId) {
        List<DuoMessage> messages = messageRepository.findByConversationIdOrderBySentAtAsc(conversationId);
        messageRepository.deleteAll(messages);
        conversationRepository.deleteById(conversationId);
    }

    // Helper method to get user info from user service
    private UserDTO getUserInfo(String userId) {
        if (userServiceClient != null) {
            try {
                return userServiceClient.getUserById(userId);
            } catch (Exception e) {
                System.err.println("Failed to fetch user info: " + e.getMessage());
            }
        }
        return new UserDTO(userId, "Unknown", "Unknown", null);
    }
}
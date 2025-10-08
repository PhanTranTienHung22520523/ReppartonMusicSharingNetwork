package com.DA2.messageservice.service;

import com.DA2.messageservice.entity.Conversation;
import com.DA2.messageservice.entity.DuoMessage;
import com.DA2.messageservice.dto.ConversationDTO;
import com.DA2.messageservice.dto.UserDTO;
import com.DA2.messageservice.repository.ConversationRepository;
import com.DA2.messageservice.repository.DuoMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class MessageService {

    @Autowired
    private ConversationRepository conversationRepository;

    @Autowired
    private DuoMessageRepository messageRepository;

    @Autowired(required = false)
    private UserServiceClient userServiceClient;

    // Get or create conversation
    @Transactional
    public Conversation getOrCreateConversation(String user1Id, String user2Id) {
        Optional<Conversation> existingConv = conversationRepository.findByUsers(user1Id, user2Id);
        
        if (existingConv.isPresent()) {
            return existingConv.get();
        }
        
        // Create new conversation
        Conversation newConversation = new Conversation(user1Id, user2Id);
        return conversationRepository.save(newConversation);
    }

    // Send message
    @Transactional
    public DuoMessage sendMessage(String senderId, String receiverId, String content) {
        // Get or create conversation
        Conversation conversation = getOrCreateConversation(senderId, receiverId);
        
        // Update last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);
        
        // Create and save message
        DuoMessage message = new DuoMessage(conversation.getId(), senderId, receiverId, content);
        return messageRepository.save(message);
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
                result.add(new ConversationDTO(conv.getId(), user1, user2));
            } catch (Exception e) {
                // If user service is unavailable, create basic DTOs
                UserDTO user1 = new UserDTO(conv.getUser1Id(), "Unknown", "Unknown", null);
                UserDTO user2 = new UserDTO(conv.getUser2Id(), "Unknown", "Unknown", null);
                result.add(new ConversationDTO(conv.getId(), user1, user2));
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

    @FeignClient(name = "user-service")
    interface UserServiceClient {
        @GetMapping("/api/users/{id}")
        UserDTO getUserById(@PathVariable("id") String id);
    }
}
package com.DA2.Repparton.Service;

import com.DA2.Repparton.DTO.ConversationDTO;
import com.DA2.Repparton.Entity.Conversation;
import com.DA2.Repparton.Entity.DuoMessage;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.ConversationRepo;
import com.DA2.Repparton.Repository.DuoMessageRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class MessageService {
    @Autowired
    private ConversationRepo conversationRepo;

    @Autowired
    private DuoMessageRepo messageRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public Conversation getOrCreateConversation(String user1, String user2) {
        return conversationRepo.findByUser1IdAndUser2Id(user1, user2)
                .or(() -> conversationRepo.findByUser2IdAndUser1Id(user1, user2))
                .orElseGet(() -> conversationRepo.save(new Conversation(null, user1, user2, LocalDateTime.now())));
    }

    public DuoMessage sendMessage(String sender, String receiver, String content) {
        Conversation conv = getOrCreateConversation(sender, receiver);
        DuoMessage msg = new DuoMessage(null, conv.getId(), sender, receiver, content, false, LocalDateTime.now());
        DuoMessage saved=messageRepo.save(msg);

        // Gửi tin nhắn real-time qua WebSocket
        messagingTemplate.convertAndSendToUser(receiver, "/queue/messages", saved);

        return saved;
    }

    public List<DuoMessage> getMessages(String convId) {
        return messageRepo.findByConversationIdOrderBySentAtAsc(convId);
    }

    public List<ConversationDTO> getConversationByUserId(String userId) {
        List<Conversation> conversations = conversationRepo.findByUser1IdOrUser2Id(userId, userId);
        List<ConversationDTO> dtoList = new ArrayList<>();

        for (Conversation conversation : conversations) {
            User user1 = userRepo.findById(conversation.getUser1Id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User 1 not found"));;
            User user2 = userRepo.findById(conversation.getUser2Id())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User 2 not found"));;
            dtoList.add(new ConversationDTO(conversation.getId(), user1, user2));
        }

        return dtoList;
    }
}


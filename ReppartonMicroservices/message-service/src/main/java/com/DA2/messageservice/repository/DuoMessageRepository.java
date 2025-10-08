package com.DA2.messageservice.repository;

import com.DA2.messageservice.entity.DuoMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DuoMessageRepository extends MongoRepository<DuoMessage, String> {
    
    List<DuoMessage> findByConversationIdOrderBySentAtAsc(String conversationId);
    
    List<DuoMessage> findByConversationIdOrderBySentAtDesc(String conversationId);
    
    List<DuoMessage> findBySenderIdOrReceiverId(String senderId, String receiverId);
    
    long countByConversationIdAndIsReadFalseAndReceiverId(String conversationId, String receiverId);
    
    List<DuoMessage> findByReceiverIdAndIsReadFalse(String receiverId);
}
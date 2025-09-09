package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.DuoMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DuoMessageRepo extends MongoRepository<DuoMessage, String> {
    List<DuoMessage> findByConversationIdOrderBySentAtAsc(String conversationId);
}


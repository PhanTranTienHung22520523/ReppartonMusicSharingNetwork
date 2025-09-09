package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface ConversationRepo extends MongoRepository<Conversation, String> {
    List<Conversation> findByUser1IdOrUser2Id(String user1Id, String user2Id);
    Optional<Conversation> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    Optional<Conversation> findByUser2IdAndUser1Id(String user1Id, String user2Id);
}


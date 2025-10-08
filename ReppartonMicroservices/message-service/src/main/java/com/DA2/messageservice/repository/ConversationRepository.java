package com.DA2.messageservice.repository;

import com.DA2.messageservice.entity.Conversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends MongoRepository<Conversation, String> {
    
    @Query("{ $or: [ { 'user1Id': ?0, 'user2Id': ?1 }, { 'user1Id': ?1, 'user2Id': ?0 } ] }")
    Optional<Conversation> findByUsers(String userId1, String userId2);
    
    Optional<Conversation> findByUser1IdAndUser2Id(String user1Id, String user2Id);
    
    @Query("{ $or: [ { 'user1Id': ?0 }, { 'user2Id': ?0 } ] }")
    List<Conversation> findByUserId(String userId);
    
    List<Conversation> findByUser1IdOrUser2Id(String user1Id, String user2Id);
}
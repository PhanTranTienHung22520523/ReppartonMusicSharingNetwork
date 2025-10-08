package com.DA2.storyservice.repository;

import com.DA2.storyservice.entity.Story;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepository extends MongoRepository<Story, String> {
    
    List<Story> findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(String userId, LocalDateTime now);
    
    List<Story> findByUserIdInAndExpiresAtAfterOrderByCreatedAtDesc(List<String> userIds, LocalDateTime now);
    
    List<Story> findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
    
    List<Story> findByUserIdAndIsPrivateFalseAndExpiresAtAfterOrderByCreatedAtDesc(String userId, LocalDateTime now);
    
    @Query("{ 'userId': { $in: ?0 }, 'isPrivate': false, 'expiresAt': { $gt: ?1 } }")
    List<Story> findActiveStoriesFromFollowedUsers(List<String> followedUserIds, LocalDateTime now);
    
    @Query("{ 'expiresAt': { $lt: ?0 } }")
    List<Story> findExpiredStories(LocalDateTime now);
    
    void deleteByExpiresAtBefore(LocalDateTime now);
    
    long countByUserId(String userId);
    
    long countByUserIdAndExpiresAtAfter(String userId, LocalDateTime now);
}
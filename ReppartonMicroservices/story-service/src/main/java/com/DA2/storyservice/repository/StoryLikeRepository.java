package com.DA2.storyservice.repository;

import com.DA2.storyservice.entity.StoryLike;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoryLikeRepository extends MongoRepository<StoryLike, String> {
    
    Optional<StoryLike> findByStoryIdAndUserId(String storyId, String userId);
    
    List<StoryLike> findByStoryId(String storyId);
    
    List<StoryLike> findByUserId(String userId);
    
    long countByStoryId(String storyId);
    
    boolean existsByStoryIdAndUserId(String storyId, String userId);
    
    void deleteByStoryIdAndUserId(String storyId, String userId);
    
    void deleteByStoryId(String storyId);
}
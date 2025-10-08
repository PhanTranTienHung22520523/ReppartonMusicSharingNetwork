package com.DA2.storyservice.repository;

import com.DA2.storyservice.entity.StoryView;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface StoryViewRepository extends MongoRepository<StoryView, String> {
    
    Optional<StoryView> findByStoryIdAndUserId(String storyId, String userId);
    
    List<StoryView> findByStoryId(String storyId);
    
    List<StoryView> findByUserId(String userId);
    
    long countByStoryId(String storyId);
    
    boolean existsByStoryIdAndUserId(String storyId, String userId);
    
    void deleteByStoryId(String storyId);
}
package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.StoryLike;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StoryLikeRepo extends MongoRepository<StoryLike, String> {
    Optional<StoryLike> findByStoryIdAndUserId(String storyId, String userId);
    long countByStoryId(String storyId);
    
}


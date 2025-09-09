package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.StoryView;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface StoryViewRepo extends MongoRepository<StoryView, String> {
    Optional<StoryView> findByStoryIdAndUserId(String storyId, String userId);
    long countByStoryId(String storyId);
}


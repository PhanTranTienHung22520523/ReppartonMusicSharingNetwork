package com.DA2.storyservice.service;

import com.DA2.storyservice.entity.Story;
import com.DA2.storyservice.entity.StoryLike;
import com.DA2.storyservice.entity.StoryView;
import com.DA2.storyservice.repository.StoryRepository;
import com.DA2.storyservice.repository.StoryLikeRepository;
import com.DA2.storyservice.repository.StoryViewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class StoryService {

    @Autowired
    private StoryRepository storyRepository;
    
    @Autowired
    private StoryLikeRepository storyLikeRepository;
    
    @Autowired
    private StoryViewRepository storyViewRepository;

    // Create story
    @CacheEvict(value = "stories", allEntries = true)
    public Story createStory(Story story) {
        story.setCreatedAt(LocalDateTime.now());
        story.setExpiresAt(LocalDateTime.now().plusHours(24));
        return storyRepository.save(story);
    }

    // Get story by ID
    @Cacheable(value = "stories", key = "#id")
    public Optional<Story> getStoryById(String id) {
        return storyRepository.findById(id);
    }

    // Get active stories by user ID
    @Cacheable(value = "userStories", key = "#userId")
    public List<Story> getActiveStoriesByUserId(String userId) {
        return storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now());
    }

    // Get public active stories by user ID
    public List<Story> getPublicActiveStoriesByUserId(String userId) {
        return storyRepository.findByUserIdAndIsPrivateFalseAndExpiresAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now());
    }

    // Get stories from followed users
    public List<Story> getStoriesFromFollowedUsers(List<String> followedUserIds) {
        return storyRepository.findActiveStoriesFromFollowedUsers(followedUserIds, LocalDateTime.now());
    }

    // Get all active stories
    public List<Story> getAllActiveStories() {
        return storyRepository.findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now());
    }

    // Delete story
    @CacheEvict(value = {"stories", "userStories"}, allEntries = true)
    @Transactional
    public boolean deleteStory(String storyId, String userId) {
        Optional<Story> storyOpt = storyRepository.findById(storyId);
        if (storyOpt.isPresent()) {
            Story story = storyOpt.get();
            if (story.getUserId().equals(userId)) {
                // Delete related likes and views
                storyLikeRepository.deleteByStoryId(storyId);
                storyViewRepository.deleteByStoryId(storyId);
                storyRepository.deleteById(storyId);
                return true;
            }
        }
        return false;
    }

    // View story
    @Transactional
    public boolean viewStory(String storyId, String userId) {
        Optional<Story> storyOpt = storyRepository.findById(storyId);
        if (storyOpt.isPresent()) {
            Story story = storyOpt.get();
            if (!story.isExpired() && !story.getUserId().equals(userId)) {
                // Check if user already viewed this story
                if (!storyViewRepository.existsByStoryIdAndUserId(storyId, userId)) {
                    // Record the view
                    StoryView storyView = new StoryView(storyId, userId);
                    storyViewRepository.save(storyView);
                    
                    // Increment view count
                    story.incrementViews();
                    storyRepository.save(story);
                    return true;
                }
            }
        }
        return false;
    }

    // Like story
    @Transactional
    public boolean likeStory(String storyId, String userId) {
        Optional<Story> storyOpt = storyRepository.findById(storyId);
        if (storyOpt.isPresent()) {
            Story story = storyOpt.get();
            if (!story.isExpired()) {
                // Check if user already liked this story
                if (!storyLikeRepository.existsByStoryIdAndUserId(storyId, userId)) {
                    // Record the like
                    StoryLike storyLike = new StoryLike(storyId, userId);
                    storyLikeRepository.save(storyLike);
                    
                    // Increment like count
                    story.incrementLikes();
                    storyRepository.save(story);
                    return true;
                }
            }
        }
        return false;
    }

    // Unlike story
    @Transactional
    public boolean unlikeStory(String storyId, String userId) {
        if (storyLikeRepository.existsByStoryIdAndUserId(storyId, userId)) {
            storyLikeRepository.deleteByStoryIdAndUserId(storyId, userId);
            
            // Decrement like count
            Optional<Story> storyOpt = storyRepository.findById(storyId);
            if (storyOpt.isPresent()) {
                Story story = storyOpt.get();
                story.decrementLikes();
                storyRepository.save(story);
                return true;
            }
        }
        return false;
    }

    // Get story statistics
    public long getStoryCount(String userId) {
        return storyRepository.countByUserId(userId);
    }

    public long getActiveStoryCount(String userId) {
        return storyRepository.countByUserIdAndExpiresAtAfter(userId, LocalDateTime.now());
    }

    // Get story likes
    public List<StoryLike> getStoryLikes(String storyId) {
        return storyLikeRepository.findByStoryId(storyId);
    }

    // Get story views
    public List<StoryView> getStoryViews(String storyId) {
        return storyViewRepository.findByStoryId(storyId);
    }

    // Check if user liked story
    public boolean hasUserLikedStory(String storyId, String userId) {
        return storyLikeRepository.existsByStoryIdAndUserId(storyId, userId);
    }

    // Check if user viewed story
    public boolean hasUserViewedStory(String storyId, String userId) {
        return storyViewRepository.existsByStoryIdAndUserId(storyId, userId);
    }

    // Scheduled task to clean up expired stories (runs every hour)
    @Scheduled(fixedRate = 3600000) // 1 hour in milliseconds
    @CacheEvict(value = {"stories", "userStories"}, allEntries = true)
    public void cleanupExpiredStories() {
        LocalDateTime now = LocalDateTime.now();
        List<Story> expiredStories = storyRepository.findExpiredStories(now);
        
        for (Story story : expiredStories) {
            // Delete related likes and views
            storyLikeRepository.deleteByStoryId(story.getId());
            storyViewRepository.deleteByStoryId(story.getId());
        }
        
        // Delete expired stories
        storyRepository.deleteByExpiresAtBefore(now);
    }
}
package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Story;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.DTO.StoryWithUserDTO;
import com.DA2.Repparton.Repository.StoryRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StoryService {

    @Autowired
    private StoryRepo storyRepository;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Transactional
    public Story createStory(String userId, String type, String textContent, MultipartFile contentFile, String songId, boolean isPrivate) throws IOException {
        // Validate input
        if (userId == null || userId.isEmpty()) {
            throw new RuntimeException("User ID is required");
        }

        String contentUrl = null;

        // Upload file if provided
        if (contentFile != null && !contentFile.isEmpty()) {
            try {
                contentUrl = cloudinaryService.uploadFile(contentFile);
            } catch (Exception e) {
                System.out.println("Failed to upload story content: " + e.getMessage());
                throw new RuntimeException("Failed to upload story content", e);
            }
        }

        // Sử dụng constructor có tham số
        Story story = new Story(userId, type, textContent);

        // Set additional fields
        if (contentUrl != null) {
            story.setMediaUrl(contentUrl);
        }
        if (songId != null && !songId.isEmpty()) {
            story.setSongId(songId);
        }
        story.setPrivate(isPrivate);

        Story savedStory = storyRepository.save(story);
        System.out.println("Story created successfully for user: " + userId);

        return savedStory;
    }

    public List<StoryWithUserDTO> getPublicStories() {
        List<Story> stories = storyRepository.findByIsPrivateFalseAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime.now());
        return stories.stream()
                .map(this::convertToStoryWithUserDTO)
                .collect(Collectors.toList());
    }

    public List<StoryWithUserDTO> getStoriesByUser(String userId) {
        List<Story> stories = storyRepository.findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(userId, LocalDateTime.now());
        return stories.stream()
                .map(this::convertToStoryWithUserDTO)
                .collect(Collectors.toList());
    }

    private StoryWithUserDTO convertToStoryWithUserDTO(Story story) {
        Optional<User> userOpt = userRepository.findById(story.getUserId());
        User user = userOpt.orElse(null);
        return new StoryWithUserDTO(story, user);
    }

    public Optional<Story> getStoryById(String id) {
        Optional<Story> story = storyRepository.findById(id);

        // Check if story has expired
        if (story.isPresent() && story.get().getExpiresAt().isBefore(LocalDateTime.now())) {
            // Auto-delete expired story
            storyRepository.deleteById(id);
            return Optional.empty();
        }

        return story;
    }

    @Transactional
    public void incrementViews(String storyId) {
        Optional<Story> storyOpt = storyRepository.findById(storyId);
        if (storyOpt.isPresent()) {
            Story story = storyOpt.get();

            // Check if story hasn't expired
            if (story.getExpiresAt().isAfter(LocalDateTime.now())) {
                story.setViews(story.getViews() + 1);
                storyRepository.save(story);
                System.out.println("Views incremented for story: " + storyId);
            }
        }
    }

    @Transactional
    public void deleteStory(String id, String userId) {
        Optional<Story> storyOpt = storyRepository.findById(id);

        if (storyOpt.isPresent()) {
            Story story = storyOpt.get();

            // Verify ownership
            if (!story.getUserId().equals(userId)) {
                throw new RuntimeException("Unauthorized to delete this story");
            }

            // Delete media from Cloudinary if present
            if (story.getMediaUrl() != null && !story.getMediaUrl().isEmpty()) {
                try {
                    cloudinaryService.deleteFileByUrl(story.getMediaUrl());
                } catch (Exception e) {
                    System.out.println("Failed to delete story media from Cloudinary: " + e.getMessage());
                }
            }

            storyRepository.deleteById(id);
            System.out.println("Story deleted: " + id + " by user: " + userId);
        } else {
            throw new RuntimeException("Story not found");
        }
    }

    @Transactional
    public void deleteExpiredStories() {
        LocalDateTime now = LocalDateTime.now();
        List<Story> expiredStories = storyRepository.findByExpiresAtBefore(now);

        for (Story story : expiredStories) {
            // Delete media from Cloudinary if present
            if (story.getMediaUrl() != null && !story.getMediaUrl().isEmpty()) {
                try {
                    cloudinaryService.deleteFileByUrl(story.getMediaUrl());
                } catch (Exception e) {
                    System.out.println("Failed to delete expired story media: " + e.getMessage());
                }
            }
        }

        storyRepository.deleteByExpiresAtBefore(now);
        System.out.println("Deleted " + expiredStories.size() + " expired stories");
    }

    public List<Story> getFollowingStories(List<String> followingUserIds) {
        return storyRepository.findByUserIdInAndIsPrivateFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                followingUserIds, LocalDateTime.now());
    }

    // Deprecated method - keeping for backward compatibility
    @Deprecated
    public List<StoryWithUserDTO> getByUser(String userId) {
        return getStoriesByUser(userId);
    }

    // Deprecated method - keeping for backward compatibility
    @Deprecated
    public void delete(String id) {
        storyRepository.deleteById(id);
    }
}

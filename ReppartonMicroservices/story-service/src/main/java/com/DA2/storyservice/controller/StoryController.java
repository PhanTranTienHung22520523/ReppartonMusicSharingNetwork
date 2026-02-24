package com.DA2.storyservice.controller;

import com.DA2.storyservice.entity.Story;
import com.DA2.storyservice.entity.StoryLike;
import com.DA2.storyservice.entity.StoryView;
import com.DA2.storyservice.service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "*")
public class StoryController {

    @Autowired
    private StoryService storyService;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    // Create a new story (JSON - legacy)
    @PostMapping
    public ResponseEntity<Story> createStory(@RequestBody Story story) {
        try {
            Story createdStory = storyService.createStory(story);
            return ResponseEntity.ok(createdStory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Create a new story with file upload
    @PostMapping("/create-auth")
    public ResponseEntity<Story> createStoryWithFile(
            @RequestParam("type") String type,
            @RequestParam(value = "textContent", required = false) String textContent,
            @RequestParam(value = "contentFile", required = false) MultipartFile contentFile,
            @RequestParam(value = "isPrivate", defaultValue = "false") Boolean isPrivate,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Story story = new Story();
            story.setUserId(userId);
            story.setType(type == null ? null : type.toLowerCase());
            story.setTextContent(textContent);
            story.setPrivate(isPrivate);
            
            // Handle file upload if present
            if (contentFile != null && !contentFile.isEmpty()) {
                String original = contentFile.getOriginalFilename();
                String safeName = original == null ? "file" : Paths.get(original).getFileName().toString();
                String ext = "";
                int dot = safeName.lastIndexOf('.');
                if (dot >= 0 && dot < safeName.length() - 1) {
                    ext = safeName.substring(dot);
                }

                String storedName = UUID.randomUUID() + ext;
                Path storyDir = Paths.get(uploadDir, "stories").toAbsolutePath().normalize();
                Files.createDirectories(storyDir);
                Path target = storyDir.resolve(storedName).normalize();
                contentFile.transferTo(target.toFile());

                // Return a URL that works from the frontend (goes through API Gateway)
                story.setContentUrl(apiGatewayUrl + "/api/stories/uploads/" + storedName);
            }
            
            Story createdStory = storyService.createStory(story);
            return ResponseEntity.ok(createdStory);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get story by ID
    @GetMapping("/{id}")
    public ResponseEntity<Story> getStoryById(@PathVariable String id) {
        Optional<Story> story = storyService.getStoryById(id);
        return story.map(ResponseEntity::ok)
                   .orElse(ResponseEntity.notFound().build());
    }

    // Get active stories by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Story>> getActiveStoriesByUserId(@PathVariable String userId) {
        List<Story> stories = storyService.getActiveStoriesByUserId(userId);
        return ResponseEntity.ok(stories);
    }

    // Get public active stories by user ID
    @GetMapping("/user/{userId}/public")
    public ResponseEntity<List<Story>> getPublicActiveStoriesByUserId(@PathVariable String userId) {
        List<Story> stories = storyService.getPublicActiveStoriesByUserId(userId);
        return ResponseEntity.ok(stories);
    }

    // Get stories from followed users
    @PostMapping("/following")
    public ResponseEntity<List<Story>> getStoriesFromFollowedUsers(@RequestBody List<String> followedUserIds) {
        List<Story> stories = storyService.getStoriesFromFollowedUsers(followedUserIds);
        return ResponseEntity.ok(stories);
    }

    // Get all active stories
    @GetMapping("/all")
    public ResponseEntity<List<Story>> getAllActiveStories() {
        List<Story> stories = storyService.getAllActiveStories();
        return ResponseEntity.ok(stories);
    }

    // Delete story
    @DeleteMapping("/{storyId}/user/{userId}")
    public ResponseEntity<Void> deleteStory(@PathVariable String storyId, @PathVariable String userId) {
        boolean deleted = storyService.deleteStory(storyId, userId);
        return deleted ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
    }

    // View story
    @PostMapping("/{storyId}/view")
    public ResponseEntity<Void> viewStory(@PathVariable String storyId, @RequestParam String userId) {
        boolean viewed = storyService.viewStory(storyId, userId);
        return viewed ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    // Like story
    @PostMapping("/{storyId}/like")
    public ResponseEntity<Void> likeStory(@PathVariable String storyId, @RequestParam String userId) {
        boolean liked = storyService.likeStory(storyId, userId);
        return liked ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    // Unlike story
    @DeleteMapping("/{storyId}/like")
    public ResponseEntity<Void> unlikeStory(@PathVariable String storyId, @RequestParam String userId) {
        boolean unliked = storyService.unlikeStory(storyId, userId);
        return unliked ? ResponseEntity.ok().build() : ResponseEntity.badRequest().build();
    }

    // Get story statistics
    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getStoryCount(@PathVariable String userId) {
        long count = storyService.getStoryCount(userId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/user/{userId}/active-count")
    public ResponseEntity<Long> getActiveStoryCount(@PathVariable String userId) {
        long count = storyService.getActiveStoryCount(userId);
        return ResponseEntity.ok(count);
    }

    // Get story likes
    @GetMapping("/{storyId}/likes")
    public ResponseEntity<List<StoryLike>> getStoryLikes(@PathVariable String storyId) {
        List<StoryLike> likes = storyService.getStoryLikes(storyId);
        return ResponseEntity.ok(likes);
    }

    // Get story views
    @GetMapping("/{storyId}/views")
    public ResponseEntity<List<StoryView>> getStoryViews(@PathVariable String storyId) {
        List<StoryView> views = storyService.getStoryViews(storyId);
        return ResponseEntity.ok(views);
    }

    // Check if user liked story
    @GetMapping("/{storyId}/liked")
    public ResponseEntity<Boolean> hasUserLikedStory(@PathVariable String storyId, @RequestParam String userId) {
        boolean liked = storyService.hasUserLikedStory(storyId, userId);
        return ResponseEntity.ok(liked);
    }

    // Check if user viewed story
    @GetMapping("/{storyId}/viewed")
    public ResponseEntity<Boolean> hasUserViewedStory(@PathVariable String storyId, @RequestParam String userId) {
        boolean viewed = storyService.hasUserViewedStory(storyId, userId);
        return ResponseEntity.ok(viewed);
    }
}
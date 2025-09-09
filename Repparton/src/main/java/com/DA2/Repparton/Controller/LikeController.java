package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@CrossOrigin(origins = "*")
public class LikeController {

    @Autowired
    private LikeService likeService;

    @PostMapping("/song/{songId}")
    public ResponseEntity<?> toggleSongLike(@PathVariable String songId, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            boolean isLiked = likeService.toggleSongLike(userId, songId);

            return ResponseEntity.ok().body(new LikeResponse(
                isLiked ? "liked" : "unliked",
                likeService.getSongLikeCount(songId),
                isLiked
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/post/{postId}")
    public ResponseEntity<?> togglePostLike(@PathVariable String postId, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            boolean isLiked = likeService.togglePostLike(userId, postId);

            return ResponseEntity.ok().body(new LikeResponse(
                isLiked ? "liked" : "unliked",
                likeService.getPostLikeCount(postId),
                isLiked
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/song/{songId}/check")
    public ResponseEntity<?> checkSongLike(@PathVariable String songId, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            boolean hasLiked = likeService.hasUserLikedSong(userId, songId);
            long likeCount = likeService.getSongLikeCount(songId);

            return ResponseEntity.ok().body(new LikeCheckResponse(hasLiked, likeCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/post/{postId}/check")
    public ResponseEntity<?> checkPostLike(@PathVariable String postId, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            boolean hasLiked = likeService.hasUserLikedPost(userId, postId);
            long likeCount = likeService.getPostLikeCount(postId);

            return ResponseEntity.ok().body(new LikeCheckResponse(hasLiked, likeCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Check if specific user liked a song (for frontend compatibility)
    @GetMapping("/song/{songId}/user/{userId}")
    public ResponseEntity<?> checkUserSongLike(@PathVariable String songId, @PathVariable String userId) {
        try {
            boolean hasLiked = likeService.hasUserLikedSong(userId, songId);
            return ResponseEntity.ok().body(new LikeStatusResponse(hasLiked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Check if specific user liked a post (for frontend compatibility)
    @GetMapping("/post/{postId}/user/{userId}")
    public ResponseEntity<?> checkUserPostLike(@PathVariable String postId, @PathVariable String userId) {
        try {
            boolean hasLiked = likeService.hasUserLikedPost(userId, postId);
            return ResponseEntity.ok().body(new LikeStatusResponse(hasLiked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    private String getCurrentUserId(Authentication auth) {
        // In a real implementation, you would extract user ID from JWT token
        // For now, return a placeholder
        return "current-user-id";
    }

    // Response DTOs
    public static class LikeResponse {
        public String action;
        public long totalLikes;
        public boolean isLiked;

        public LikeResponse(String action, long totalLikes, boolean isLiked) {
            this.action = action;
            this.totalLikes = totalLikes;
            this.isLiked = isLiked;
        }
    }

    public static class LikeCheckResponse {
        public boolean hasLiked;
        public long totalLikes;

        public LikeCheckResponse(boolean hasLiked, long totalLikes) {
            this.hasLiked = hasLiked;
            this.totalLikes = totalLikes;
        }
    }

    // Additional response DTO
    public static class LikeStatusResponse {
        public boolean liked;

        public LikeStatusResponse(boolean liked) {
            this.liked = liked;
        }
    }
}

package com.DA2.postservice.controller;

import com.DA2.postservice.entity.Post;
import com.DA2.postservice.entity.PostLike;
import com.DA2.postservice.service.PostService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Post Service is running");
    }

    // Create post
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Post post) {
        try {
            Post created = postService.createPost(post);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post created successfully",
                "post", created
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPost(@PathVariable String postId) {
        try {
            Post post = postService.getPostById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get posts by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.getPostsByUser(userId, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get feed (posts from followed users)
    @PostMapping("/feed")
    public ResponseEntity<?> getFeed(
            @RequestBody Map<String, List<String>> request,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            List<String> userIds = request.get("userIds");
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.getFeed(userIds, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get public posts
    @GetMapping("/public")
    public ResponseEntity<?> getPublicPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.getPublicPosts(pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get trending posts
    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingPosts(
            @RequestParam(defaultValue = "7") int days) {
        try {
            List<Post> posts = postService.getTrendingPosts(days);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "posts", posts
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update post
    @PutMapping("/{postId}")
    public ResponseEntity<?> updatePost(
            @PathVariable String postId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            String content = request.get("content");
            Post updated = postService.updatePost(postId, userId, content);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post updated successfully",
                "post", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Delete post
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            postService.deletePost(postId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Like post
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(
            @PathVariable String postId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            postService.likePost(postId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post liked successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Unlike post
    @DeleteMapping("/{postId}/like")
    public ResponseEntity<?> unlikePost(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            postService.unlikePost(postId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post unliked successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Check if user liked post
    @GetMapping("/{postId}/liked")
    public ResponseEntity<?> isPostLiked(
            @PathVariable String postId,
            @RequestParam String userId) {
        try {
            boolean liked = postService.isPostLikedByUser(postId, userId);
            return ResponseEntity.ok(Map.of("liked", liked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get post likes
    @GetMapping("/{postId}/likes")
    public ResponseEntity<?> getPostLikes(@PathVariable String postId) {
        try {
            List<PostLike> likes = postService.getPostLikes(postId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Share post
    @PostMapping("/{postId}/share")
    public ResponseEntity<?> sharePost(@PathVariable String postId) {
        try {
            postService.sharePost(postId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post shared successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Search posts
    @GetMapping("/search")
    public ResponseEntity<?> searchPosts(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.searchPosts(query, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get post statistics
    @GetMapping("/{postId}/statistics")
    public ResponseEntity<?> getPostStatistics(@PathVariable String postId) {
        try {
            PostService.PostStatistics stats = postService.getPostStatistics(postId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Search posts by location name
    @GetMapping("/search/location")
    public ResponseEntity<?> searchPostsByLocation(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.searchPostsByLocation(query, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get posts near location
    @GetMapping("/nearby")
    public ResponseEntity<?> getPostsNearLocation(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "10.0") Double radiusKm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            List<Post> posts = postService.getPostsNearLocation(latitude, longitude, radiusKm, pageable);
            return ResponseEntity.ok(Map.of(
                "posts", posts,
                "total", posts.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

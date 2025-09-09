package com.DA2.Repparton.Controller;

import com.DA2.Repparton.DTO.PostDTO;
import com.DA2.Repparton.Service.PostService;
import com.DA2.Repparton.Service.UserService;
import com.DA2.Repparton.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostService postService;
    
    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam String content,
            @RequestParam(required = false) MultipartFile mediaFile,
            Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            PostDTO post = postService.createPost(userId, content, mediaFile);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post created successfully",
                "post", post
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = postService.getPublicPosts(pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUser(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = postService.getPostsByUser(userId, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/feed")
    public ResponseEntity<?> getUserFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            Pageable pageable = PageRequest.of(page, size);
            Page<PostDTO> posts = postService.getFeed(userId, pageable);
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingPosts(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<PostDTO> posts = postService.getTrendingPosts(limit);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "posts", posts
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable String id,
            @RequestBody UpdatePostRequest request,
            Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            PostDTO updatedPost = postService.updatePost(id, userId, request.getContent());

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Post updated successfully",
                "post", updatedPost
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable String id, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            postService.deletePost(id, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Post deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Error: " + e.getMessage()));
        }
    }

    private String getCurrentUserId(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("Authentication required");
        }
        
        // auth.getName() returns the email from JWT token
        String email = auth.getName();
        
        // Find user by email and return the user ID
        try {
            Optional<User> userOpt = Optional.ofNullable(userService.findByEmail(email));
            if (userOpt.isPresent()) {
                return userOpt.get().getId();
            } else {
                throw new RuntimeException("User not found");
            }
        } catch (Exception e) {
            throw new RuntimeException("User not found: " + email);
        }
    }

    // Inner class for request body
    public static class UpdatePostRequest {
        private String content;

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
}

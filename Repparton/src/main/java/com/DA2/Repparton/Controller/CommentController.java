package com.DA2.Repparton.Controller;

import com.DA2.Repparton.DTO.CommentDTO;
import com.DA2.Repparton.Entity.Comment;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Service.CommentService;
import com.DA2.Repparton.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
    @Autowired
    private CommentService commentService;

    @Autowired
    private UserService userService;

    // Helper method to get current user ID from authentication
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

    @PostMapping("/create")
    public ResponseEntity<?> createComment(@RequestParam String userId,
                                           @RequestParam String songId,
                                           @RequestParam(required = false) String parentId,
                                           @RequestParam String content) {
        return ResponseEntity.ok(commentService.createSongComment(userId, songId, parentId, content));
    }

    @GetMapping("/song/{songId}")
    public List<CommentDTO> getComments(@PathVariable String songId) {
        return commentService.getCommentsBySong(songId);
    }

    @GetMapping("/reply/{parentId}")
    public ResponseEntity<?> getReplies(@PathVariable String parentId) {
        return ResponseEntity.ok(commentService.getReplies(parentId));
    }

    // Comment on posts
    @PostMapping("/post/{postId}")
    public ResponseEntity<?> addCommentToPost(@PathVariable String postId,
                                             @RequestParam String content,
                                             Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = getCurrentUserId(auth);
            var result = commentService.createPostComment(userId, postId, null, content);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/song/{songId}/auth")
    public ResponseEntity<?> addCommentToSong(@PathVariable String songId,
                                             @RequestParam String content,
                                             @RequestParam(required = false) String parentId,
                                             Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = getCurrentUserId(auth);
            var result = commentService.createSongComment(userId, songId, parentId, content);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getPostComments(@PathVariable String postId) {
        try {
            var comments = commentService.getCommentsByPost(postId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Playlist comments
    @PostMapping("/playlist/{playlistId}")
    public ResponseEntity<?> addCommentToPlaylist(@PathVariable String playlistId,
                                                 @RequestParam String content,
                                                 @RequestParam(required = false) String parentId,
                                                 Authentication auth) {
        try {
            System.out.println("DEBUG: Adding comment to playlist: " + playlistId);
            System.out.println("DEBUG: Content: " + content);
            System.out.println("DEBUG: Auth: " + (auth != null ? auth.getName() : "null"));

            if (auth == null) {
                System.out.println("DEBUG: Authentication is null, returning 401");
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = getCurrentUserId(auth);
            var result = commentService.createPlaylistComment(userId, playlistId, parentId, content);
            System.out.println("DEBUG: Comment created successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("DEBUG: Error creating playlist comment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/playlist/{playlistId}")
    public ResponseEntity<?> getPlaylistComments(@PathVariable String playlistId) {
        try {
            System.out.println("DEBUG: Getting comments for playlist: " + playlistId);
            var comments = commentService.getCommentsByPlaylist(playlistId);
            System.out.println("DEBUG: Found " + comments.size() + " comments");
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            System.err.println("DEBUG: Error getting playlist comments: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Delete comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable String commentId, Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = getCurrentUserId(auth);
            commentService.deleteComment(commentId, userId);
            return ResponseEntity.ok().body("Comment deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Like/Unlike comment
    @PostMapping("/{commentId}/like")
    public ResponseEntity<?> likeComment(@PathVariable String commentId, Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = getCurrentUserId(auth);
            // TODO: Implement comment like functionality
            return ResponseEntity.ok().body("Comment like functionality not implemented yet");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Add reply to comment  
    @PostMapping("/{commentId}/reply")
    public ResponseEntity<?> addReplyToComment(@PathVariable String commentId,
                                              @RequestParam String content,
                                              Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = getCurrentUserId(auth);
            
            // Get parent comment to determine the type (song, post, or playlist)
            var parentComment = commentService.getCommentById(commentId);
            if (parentComment == null) {
                return ResponseEntity.badRequest().body("Parent comment not found");
            }
            
            Comment reply;
            if (parentComment.getSongId() != null) {
                reply = commentService.createSongComment(userId, parentComment.getSongId(), commentId, content);
            } else if (parentComment.getPostId() != null) {
                reply = commentService.createPostComment(userId, parentComment.getPostId(), commentId, content);
            } else if (parentComment.getPlaylistId() != null) {
                reply = commentService.createPlaylistComment(userId, parentComment.getPlaylistId(), commentId, content);
            } else {
                return ResponseEntity.badRequest().body("Invalid parent comment type");
            }
            
            return ResponseEntity.ok(reply);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // DTO classes for request bodies
    public static class CommentRequest {
        private String content;
        private String parentId;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public String getParentId() { return parentId; }
        public void setParentId(String parentId) { this.parentId = parentId; }
    }
}


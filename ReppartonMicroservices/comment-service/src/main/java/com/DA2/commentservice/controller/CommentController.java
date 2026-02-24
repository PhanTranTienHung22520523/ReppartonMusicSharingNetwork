package com.DA2.commentservice.controller;

import com.DA2.commentservice.entity.Comment;
import com.DA2.commentservice.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Comment Service is running");
    }

    private String requireAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        String userId = String.valueOf(authentication.getPrincipal());
        if (userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return userId;
    }

    private String getOptionalAuthenticatedUserId() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated() || authentication.getPrincipal() == null) {
                return null;
            }
            String userId = String.valueOf(authentication.getPrincipal());
            if (userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
                return null;
            }
            return userId;
        } catch (Exception ignored) {
            return null;
        }
    }

    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Comment comment) {
        try {
            // Never trust client-provided userId; derive from JWT
            comment.setUserId(requireAuthenticatedUserId());
            Comment created = commentService.createComment(comment);
            return ResponseEntity.ok(Map.of("success", true, "comment", created));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Frontend compatibility: Add comment to a post (x-www-form-urlencoded)
    @PostMapping("/post/{postId}")
    public ResponseEntity<?> addCommentToPost(
            @PathVariable("postId") String postId,
            @RequestParam("content") String content) {
        try {
            Comment comment = new Comment();
            comment.setUserId(requireAuthenticatedUserId());
            comment.setPostId(postId);
            comment.setContent(content);
            Comment created = commentService.createComment(comment);
            return ResponseEntity.ok(Map.of("success", true, "comment", created));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Frontend compatibility: Add comment to a song (x-www-form-urlencoded)
    @PostMapping("/song/{songId}/auth")
    public ResponseEntity<?> addCommentToSong(
            @PathVariable("songId") String songId,
            @RequestParam("content") String content) {
        try {
            Comment comment = new Comment();
            comment.setUserId(requireAuthenticatedUserId());
            comment.setSongId(songId);
            comment.setContent(content);
            Comment created = commentService.createComment(comment);
            return ResponseEntity.ok(Map.of("success", true, "comment", created));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Frontend compatibility: Add comment to a playlist (x-www-form-urlencoded)
    @PostMapping("/playlist/{playlistId}")
    public ResponseEntity<?> addCommentToPlaylist(
            @PathVariable("playlistId") String playlistId,
            @RequestParam("content") String content,
            @RequestParam(value = "parentId", required = false) String parentId) {
        try {
            Comment comment = new Comment();
            comment.setUserId(requireAuthenticatedUserId());
            comment.setPlaylistId(playlistId);
            comment.setParentId(parentId);
            comment.setContent(content);
            Comment created = commentService.createComment(comment);
            return ResponseEntity.ok(Map.of("success", true, "comment", created));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/song/{songId}")
    public ResponseEntity<?> getSongComments(
            @PathVariable("songId") String songId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            String viewerUserId = getOptionalAuthenticatedUserId();
            Page<Comment> comments = commentService.getCommentsBySong(songId, PageRequest.of(page, size), viewerUserId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<?> getPostComments(
            @PathVariable("postId") String postId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            String viewerUserId = getOptionalAuthenticatedUserId();
            Page<Comment> comments = commentService.getCommentsByPost(postId, PageRequest.of(page, size), viewerUserId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/playlist/{playlistId}")
    public ResponseEntity<?> getPlaylistComments(
            @PathVariable("playlistId") String playlistId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            // Currently returns a simple List (not paged). We accept page/size for frontend compatibility.
            String viewerUserId = getOptionalAuthenticatedUserId();
            List<Comment> comments = commentService.getCommentsByPlaylist(playlistId, viewerUserId);
            return ResponseEntity.ok(comments);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{commentId}/replies")
    public ResponseEntity<?> getReplies(@PathVariable("commentId") String commentId) {
        try {
            String viewerUserId = getOptionalAuthenticatedUserId();
            List<Comment> replies = commentService.getReplies(commentId, viewerUserId);
            return ResponseEntity.ok(replies);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable("commentId") String commentId,
            @RequestBody Map<String, String> request) {
        try {
            String content = request.get("content");
            String userId = requireAuthenticatedUserId();
            Comment updated = commentService.updateComment(commentId, userId, content);
            return ResponseEntity.ok(Map.of("success", true, "comment", updated));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable("commentId") String commentId,
            @RequestParam(value = "userId", required = false) String userId) {
        try {
            // Ignore client-provided userId; derive from JWT
            commentService.deleteComment(commentId, requireAuthenticatedUserId());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Frontend compatibility: Add reply to a comment
    @PostMapping("/{commentId}/reply")
    public ResponseEntity<?> addReplyToComment(
            @PathVariable("commentId") String commentId,
            @RequestParam("content") String content) {
        try {
            Comment parent = commentService.getCommentById(commentId)
                    .orElseThrow(() -> new RuntimeException("Parent comment not found"));

            Comment reply = new Comment();
            reply.setUserId(requireAuthenticatedUserId());
            reply.setParentId(commentId);
            reply.setContent(content);
            reply.setPostId(parent.getPostId());
            reply.setSongId(parent.getSongId());
            reply.setPlaylistId(parent.getPlaylistId());

            Comment created = commentService.createComment(reply);
            return ResponseEntity.ok(Map.of("success", true, "comment", created));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // Frontend compatibility: Like a comment (simple counter)
    @PostMapping("/{commentId}/like")
    public ResponseEntity<?> likeComment(@PathVariable("commentId") String commentId) {
        try {
            // Must be authenticated to like
            String actorUserId = requireAuthenticatedUserId();
            Comment updated = commentService.likeComment(commentId, actorUserId);
            return ResponseEntity.ok(Map.of("success", true, "comment", updated));
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).body(Map.of("success", false, "message", e.getReason()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/count")
    public ResponseEntity<?> getCommentCount(
            @RequestParam("itemId") String itemId,
            @RequestParam("type") String type) {
        try {
            long count = commentService.getCommentCount(itemId, type);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

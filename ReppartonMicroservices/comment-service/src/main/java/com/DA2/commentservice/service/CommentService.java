package com.DA2.commentservice.service;

import com.DA2.commentservice.entity.Comment;
import com.DA2.commentservice.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    @Value("${user.service.public-url:http://localhost:8081/api/users/public}")
    private String userServicePublicUrl;

    @Value("${notification.service.url:http://localhost:8086/api/notifications}")
    private String notificationServiceUrl;

    private static class ItemInfo {
        final String ownerId;
        final String label;
        final String type;
        final String id;

        ItemInfo(String ownerId, String label, String type, String id) {
            this.ownerId = ownerId;
            this.label = label;
            this.type = type;
            this.id = id;
        }
    }

    private ItemInfo resolveTarget(Comment comment) {
        if (comment == null) return null;

        try {
            if (comment.getSongId() != null && !comment.getSongId().isBlank()) {
                String id = comment.getSongId();
                Map<?, ?> res = restTemplate.getForObject(apiGatewayUrl + "/api/songs/" + id, Map.class);
                Map<?, ?> data = res == null ? null : (Map<?, ?>) res.get("data");
                if (data == null) return null;
                String ownerId = (String) data.get("uploadedBy");
                String label = (String) data.get("title");
                return ownerId == null ? null : new ItemInfo(ownerId, label, "song", id);
            }

            if (comment.getPostId() != null && !comment.getPostId().isBlank()) {
                String id = comment.getPostId();
                Map<?, ?> data = restTemplate.getForObject(apiGatewayUrl + "/api/posts/" + id, Map.class);
                if (data == null) return null;
                String ownerId = (String) data.get("userId");
                String content = (String) data.get("content");
                String label = content == null ? null : (content.length() > 40 ? content.substring(0, 40) + "..." : content);
                return ownerId == null ? null : new ItemInfo(ownerId, label, "post", id);
            }

            if (comment.getPlaylistId() != null && !comment.getPlaylistId().isBlank()) {
                String id = comment.getPlaylistId();
                Map<?, ?> data = restTemplate.getForObject(apiGatewayUrl + "/api/playlists/" + id, Map.class);
                if (data == null) return null;
                String ownerId = (String) data.get("userId");
                String label = (String) data.get("name");
                return ownerId == null ? null : new ItemInfo(ownerId, label, "playlist", id);
            }
        } catch (Exception ignored) {
            return null;
        }

        return null;
    }

    private void sendNotification(String recipientId, String actorId, String type, String title, String message, String referenceId) {
        if (recipientId == null || recipientId.isBlank()) return;
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", recipientId);
            body.put("actorId", actorId);
            body.put("type", type);
            body.put("title", title);
            body.put("message", message);
            body.put("referenceId", referenceId);
            restTemplate.postForObject(notificationServiceUrl, body, Object.class);
        } catch (Exception ignored) {
            // Best-effort only
        }
    }

    private String resolveUserLabel(String userId) {
        if (userId == null || userId.isBlank()) return userId;

        Map<String, Object> user = null;

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> res = restTemplate.getForObject(
                    apiGatewayUrl + "/api/users/public/" + userId,
                    Map.class
            );
            user = res;
        } catch (Exception ignored) {
            // fall through
        }

        if (user == null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> res = restTemplate.getForObject(
                        userServicePublicUrl + "/" + userId,
                        Map.class
                );
                user = res;
            } catch (Exception ignored) {
                return userId;
            }
        }

        Object username = user.get("username");
        if (username instanceof String && !((String) username).isBlank()) return (String) username;

        Object fullName = user.get("fullName");
        if (fullName instanceof String && !((String) fullName).isBlank()) return (String) fullName;

        return userId;
    }

    void hydrateUserFields(Comment comment) {
        if (comment == null) return;
        if (comment.getUserId() == null || comment.getUserId().isBlank()) return;

        Map<String, Object> user = null;

        // Prefer gateway URL (respects service discovery/routing)
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> res = restTemplate.getForObject(
                    apiGatewayUrl + "/api/users/public/" + comment.getUserId(),
                    Map.class
            );
            user = res;
        } catch (Exception ignored) {
            // fall through
        }

        // Fallback to direct user-service (useful if gateway route is protected/misconfigured)
        if (user == null) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> res = restTemplate.getForObject(
                        userServicePublicUrl + "/" + comment.getUserId(),
                        Map.class
                );
                user = res;
            } catch (Exception ignored) {
                return;
            }
        }

        Object username = user.get("username");
        Object fullName = user.get("fullName");
        Object avatar = user.get("avatar");

        if (comment.getUserName() == null || comment.getUserName().isBlank()) {
            String name = username instanceof String ? (String) username : null;
            if (name == null || name.isBlank()) {
                name = fullName instanceof String ? (String) fullName : null;
            }
            comment.setUserName(name);
        }

        if (comment.getUserAvatar() == null || comment.getUserAvatar().isBlank()) {
            comment.setUserAvatar(avatar instanceof String ? (String) avatar : null);
        }
    }

    private void applyLikedFlag(Comment comment, String viewerUserId) {
        if (comment == null) return;
        if (viewerUserId == null || viewerUserId.isBlank()) {
            comment.setLiked(false);
            return;
        }

        Set<String> likedBy = comment.getLikedBy();
        comment.setLiked(likedBy != null && likedBy.contains(viewerUserId));
    }

    private void ensureLikedByInitialized(Comment comment) {
        if (comment == null) return;
        if (comment.getLikedBy() == null) {
            comment.setLikedBy(new HashSet<>());
        }
    }

    @Transactional
    public Comment createComment(Comment comment) {
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new RuntimeException("Comment content is required");
        }
        comment.setCreatedAt(LocalDateTime.now());

        // Best-effort author display info so frontend can show name/avatar
        hydrateUserFields(comment);

        ensureLikedByInitialized(comment);
        comment.setLiked(false);

        Comment saved = commentRepository.save(comment);

        // If this is a reply, notify the parent comment author (best-effort)
        if (saved.getParentId() != null && !saved.getParentId().isBlank()) {
            try {
                Optional<Comment> parentOpt = commentRepository.findById(saved.getParentId());
                if (parentOpt.isPresent()) {
                    Comment parent = parentOpt.get();
                    String recipientId = parent.getUserId();
                    if (recipientId != null && !recipientId.isBlank() && !recipientId.equals(saved.getUserId())) {
                        String actorLabel = (saved.getUserName() != null && !saved.getUserName().isBlank())
                                ? saved.getUserName()
                                : saved.getUserId();

                        String referenceId = null;
                        if (saved.getPostId() != null && !saved.getPostId().isBlank()) referenceId = saved.getPostId();
                        else if (saved.getSongId() != null && !saved.getSongId().isBlank()) referenceId = saved.getSongId();
                        else if (saved.getPlaylistId() != null && !saved.getPlaylistId().isBlank()) referenceId = saved.getPlaylistId();
                        else referenceId = saved.getParentId();

                        sendNotification(
                                recipientId,
                                saved.getUserId(),
                                "comment_reply",
                                "New reply",
                                "User " + saved.getUserId() + " replied to your comment",
                                referenceId
                        );
                    }
                }
            } catch (Exception ignored) {
                // Best-effort only
            }
        }

        // Notify the content owner (best-effort)
        ItemInfo target = resolveTarget(saved);
        if (target != null && target.ownerId != null && !target.ownerId.equals(saved.getUserId())) {
            String label = target.label == null ? "" : (": \"" + target.label + "\"");
            sendNotification(
                    target.ownerId,
                    saved.getUserId(),
                    "comment",
                    "New comment",
                    "User " + saved.getUserId() + " commented on your " + target.type + label,
                    target.id
            );
        }

        return saved;
    }

    public Optional<Comment> getCommentById(String commentId) {
        return commentRepository.findById(commentId);
    }

    @Transactional
    public Comment likeComment(String commentId, String actorUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        ensureLikedByInitialized(comment);

        boolean alreadyLiked = actorUserId != null
                && !actorUserId.isBlank()
                && comment.getLikedBy().contains(actorUserId);

        boolean nowLiked;
        if (alreadyLiked) {
            comment.getLikedBy().remove(actorUserId);
            comment.decrementLikes();
            nowLiked = false;
        } else {
            if (actorUserId != null && !actorUserId.isBlank()) {
                comment.getLikedBy().add(actorUserId);
            }
            comment.incrementLikes();
            nowLiked = true;
        }

        comment.setUpdatedAt(LocalDateTime.now());

        Comment saved = commentRepository.save(comment);

        saved.setLiked(nowLiked);

        // Notify comment owner (best-effort)
        if (nowLiked
                && saved.getUserId() != null
                && !saved.getUserId().isBlank()
                && actorUserId != null
                && !actorUserId.isBlank()
                && !saved.getUserId().equals(actorUserId)) {
            String referenceId = null;
            if (saved.getPostId() != null && !saved.getPostId().isBlank()) referenceId = saved.getPostId();
            else if (saved.getSongId() != null && !saved.getSongId().isBlank()) referenceId = saved.getSongId();
            else if (saved.getPlaylistId() != null && !saved.getPlaylistId().isBlank()) referenceId = saved.getPlaylistId();
            else referenceId = saved.getId();

            String actorLabel = resolveUserLabel(actorUserId);
            sendNotification(
                    saved.getUserId(),
                    actorUserId,
                    "comment_like",
                    "New like",
                    "User " + actorUserId + " liked your comment",
                    referenceId
            );
        }

        return saved;
    }

    public Page<Comment> getCommentsBySong(String songId, Pageable pageable, String viewerUserId) {
        Page<Comment> page = commentRepository.findBySongIdOrderByCreatedAtDesc(songId, pageable);
        page.getContent().forEach((c) -> {
            hydrateUserFields(c);
            applyLikedFlag(c, viewerUserId);
        });
        return page;
    }

    public Page<Comment> getCommentsByPost(String postId, Pageable pageable, String viewerUserId) {
        Page<Comment> page = commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
        page.getContent().forEach((c) -> {
            hydrateUserFields(c);
            applyLikedFlag(c, viewerUserId);
        });
        return page;
    }

    public List<Comment> getCommentsByPlaylist(String playlistId, String viewerUserId) {
        List<Comment> comments = commentRepository.findByPlaylistIdOrderByCreatedAtDesc(playlistId);
        comments.forEach((c) -> {
            hydrateUserFields(c);
            applyLikedFlag(c, viewerUserId);
        });
        return comments;
    }

    public List<Comment> getReplies(String commentId, String viewerUserId) {
        List<Comment> replies = commentRepository.findByParentIdOrderByCreatedAtAsc(commentId);
        replies.forEach((c) -> {
            hydrateUserFields(c);
            applyLikedFlag(c, viewerUserId);
        });
        return replies;
    }

    @Transactional
    public Comment updateComment(String commentId, String userId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        comment.setContent(newContent);
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        commentRepository.deleteById(commentId);
    }

    public long getCommentCount(String itemId, String type) {
        switch (type) {
            case "song": return commentRepository.countBySongId(itemId);
            case "post": return commentRepository.countByPostId(itemId);
            case "playlist": return commentRepository.countByPlaylistId(itemId);
            default: return 0;
        }
    }
}

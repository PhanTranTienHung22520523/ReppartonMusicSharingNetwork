package com.DA2.postservice.service;

import com.DA2.postservice.entity.Post;
import com.DA2.postservice.entity.PostLike;
import com.DA2.postservice.repository.PostRepository;
import com.DA2.postservice.repository.PostLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private LocationService locationService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    @Value("${notification.service.url:http://localhost:8086/api/notifications}")
    private String notificationServiceUrl;

    // Create post
    @Transactional
    public Post createPost(Post post) {
        if (post.getContent() == null || post.getContent().trim().isEmpty()) {
            throw new RuntimeException("Post content cannot be empty");
        }

        // Handle location check-in
        if (post.getLatitude() != null && post.getLongitude() != null) {
            // Reverse geocode coordinates to get location name
            if (post.getLocationName() == null) {
                String locationName = locationService.reverseGeocode(post.getLatitude(), post.getLongitude());
                post.setLocationName(locationName);
            }
        } else if (post.getLocationName() != null && !post.getLocationName().trim().isEmpty()) {
            // Geocode location name to get coordinates
            var coordinates = locationService.geocode(post.getLocationName());
            if (coordinates != null) {
                post.setLatitude(coordinates.get("latitude"));
                post.setLongitude(coordinates.get("longitude"));
            }
        }

        post.setCreatedAt(LocalDateTime.now());
        Post created = postRepository.save(post);

        // Notify followers (best-effort) for public posts only
        if (!created.isPrivate() && created.getUserId() != null && !created.getUserId().isBlank()) {
            notifyFollowersOfNewPost(created);
        }

        // Notify original post author if this is a share
        if ("SHARE".equals(created.getType()) && created.getSharedPostId() != null) {
            notifyOriginalAuthorOfShare(created);
        }

        return created;
    }

    private void notifyOriginalAuthorOfShare(Post sharePost) {
        try {
            Optional<Post> originalOpt = postRepository.findById(sharePost.getSharedPostId());
            if (originalOpt.isPresent()) {
                Post original = originalOpt.get();
                // Don't notify if sharing own post
                if (original.getUserId() != null && !original.getUserId().equals(sharePost.getUserId())) {
                    String actorId = sharePost.getUserId();
                    sendNotification(
                        original.getUserId(),
                        actorId,
                        "share",
                        "Post shared",
                        "User " + actorId + " shared your post",
                        sharePost.getId()
                    );
                }
            }
        } catch (Exception ignored) {}
    }

    // Get post by ID
    public Optional<Post> getPostById(String postId) {
        return postRepository.findById(postId);
    }

    // Get posts by user
    public Page<Post> getPostsByUser(String userId, Pageable pageable) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    // Get feed (posts from followed users)
    public Page<Post> getFeed(List<String> userIds, Pageable pageable) {
        return postRepository.findByUserIdInOrderByCreatedAtDesc(userIds, pageable);
    }

    // Get public posts
    public Page<Post> getPublicPosts(Pageable pageable) {
        return postRepository.findByIsPrivateFalseOrderByCreatedAtDesc(pageable);
    }

    // Get trending posts
    public List<Post> getTrendingPosts(int days, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        Sort sort = Sort.by(Sort.Direction.DESC, "likes").and(Sort.by(Sort.Direction.DESC, "createdAt"));
        Pageable pageable = PageRequest.of(0, safeLimit, sort);

        if (days <= 0) {
            return postRepository.findTrendingPostsAll(pageable);
        }

        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return postRepository.findTrendingPostsSince(since, pageable);
    }

    // Update post
    @Transactional
    public Post updatePost(String postId, String userId, String newContent) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this post");
        }

        post.setContent(newContent);
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // Delete post
    @Transactional
    public void deletePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        // Delete all likes for this post
        postLikeRepository.deleteByPostId(postId);
        
        postRepository.deleteById(postId);
    }

    // Like post
    @Transactional
    public void likePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if already liked
        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isPresent()) {
            throw new RuntimeException("Post already liked");
        }

        // Create like
        PostLike like = new PostLike(postId, userId);
        postLikeRepository.save(like);

        // Increment likes count
        post.incrementLikes();
        postRepository.save(post);

        // Notify post owner (best-effort)
        if (post.getUserId() != null && !post.getUserId().isBlank() && userId != null && !userId.equals(post.getUserId())) {
            sendNotification(
                    post.getUserId(),
                    userId,
                    "like",
                    "New like",
                    "User " + userId + " liked your post",
                    postId
            );
        }
    }

    // Unlike post
    @Transactional
    public void unlikePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        PostLike like = postLikeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new RuntimeException("Post not liked yet"));

        postLikeRepository.delete(like);

        // Decrement likes count
        post.decrementLikes();
        postRepository.save(post);
    }

    // Check if user liked post
    public boolean isPostLikedByUser(String postId, String userId) {
        return postLikeRepository.findByPostIdAndUserId(postId, userId).isPresent();
    }

    // Get post likes
    public List<PostLike> getPostLikes(String postId) {
        return postLikeRepository.findByPostId(postId);
    }

    // Get liked posts by user
    public List<PostLike> getLikedPostsByUser(String userId) {
        return postLikeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Increment share count
    @Transactional
    public void sharePost(String postId) {
        sharePost(postId, null);
    }

    @Transactional
    public void sharePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.incrementShares();
        postRepository.save(post);

        // Notify post owner (best-effort)
        if (post.getUserId() != null && !post.getUserId().isBlank() && (userId != null && !userId.equals(post.getUserId()))) {
            sendNotification(
                    post.getUserId(),
                    userId,
                    "share",
                    "Post shared",
                    "User " + userId + " shared your post",
                    postId
            );
        }
    }

    private void notifyFollowersOfNewPost(Post created) {
        try {
            List<String> followerIds = getFollowerIds(created.getUserId());
            if (followerIds.isEmpty()) return;

            String snippet = created.getContent();
            if (snippet != null) {
                snippet = snippet.trim();
                if (snippet.length() > 60) snippet = snippet.substring(0, 60) + "…";
            }

            int limit = Math.min(200, followerIds.size());
            for (int i = 0; i < limit; i++) {
                String followerId = followerIds.get(i);
                if (followerId == null || followerId.isBlank()) continue;
                if (followerId.equals(created.getUserId())) continue;

                sendNotification(
                        followerId,
                        created.getUserId(),
                        "post",
                        "New post",
                        "User " + created.getUserId() + " posted" + (snippet == null || snippet.isBlank() ? "" : (": " + snippet)),
                        created.getId()
                );
            }
        } catch (Exception ignored) {
            // best-effort
        }
    }

    private List<String> getFollowerIds(String userId) {
        List<String> ids = new ArrayList<>();
        try {
            Object res = restTemplate.getForObject(apiGatewayUrl + "/api/social/followers/" + userId, Object.class);
            if (!(res instanceof List<?> list)) return ids;
            for (Object item : list) {
                String id = extractUserId(item);
                if (id != null && !id.isBlank()) ids.add(id);
            }
        } catch (Exception ignored) {
            // best-effort
        }
        return ids;
    }

    private String extractUserId(Object item) {
        if (item == null) return null;
        if (item instanceof String s) return s;
        if (item instanceof Map<?, ?> map) {
            Object v = map.get("id");
            if (v == null) v = map.get("userId");
            if (v == null) v = map.get("_id");
            if (v == null) v = map.get("email");
            return v == null ? null : String.valueOf(v);
        }
        return null;
    }

    private void sendNotification(String recipientId, String actorId, String type, String title, String message, String referenceId) {
        try {
            if (recipientId == null || recipientId.isBlank()) return;
            
            // Prepare a dynamic map to avoid issues with null values in Map.of
            java.util.Map<String, Object> body = new java.util.HashMap<>();
            body.put("userId", recipientId);
            body.put("actorId", actorId);
            body.put("type", type);
            body.put("title", title);
            body.put("message", message);
            body.put("referenceId", referenceId);
            
            restTemplate.postForObject(notificationServiceUrl, body, Object.class);
        } catch (Exception ignored) {
            // best-effort
        }
    }

    // Search posts
    public Page<Post> searchPosts(String query, Pageable pageable) {
        return postRepository.searchByContent(query, pageable);
    }

    // Get post statistics
    public PostStatistics getPostStatistics(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        long likesCount = postLikeRepository.countByPostId(postId);
        
        PostStatistics stats = new PostStatistics();
        stats.setPostId(postId);
        stats.setLikes(likesCount);
        stats.setShares(post.getShares());
        stats.setComments(post.getComments());
        
        return stats;
    }

    // Search posts by location
    public Page<Post> searchPostsByLocation(String locationQuery, Pageable pageable) {
        return postRepository.findByLocationNameContainingIgnoreCaseOrderByCreatedAtDesc(locationQuery, pageable);
    }

    // Get posts near a location
    public List<Post> getPostsNearLocation(Double latitude, Double longitude, Double radiusKm, Pageable pageable) {
        // For MongoDB, we'll need to implement geospatial queries
        // For now, return all posts with location (simplified implementation)
        Page<Post> postsPage = postRepository.findByLatitudeNotNullAndLongitudeNotNull(pageable);
        List<Post> postsWithLocation = postsPage.getContent();

        // Filter by distance (this should be done in database for performance)
        return postsWithLocation.stream()
                .filter(post -> {
                    if (post.getLatitude() == null || post.getLongitude() == null) {
                        return false;
                    }
                    double distance = locationService.calculateDistance(
                        latitude, longitude, post.getLatitude(), post.getLongitude());
                    return distance <= radiusKm;
                })
                .toList();
    }

    // Inner class for statistics
    public static class PostStatistics {
        private String postId;
        private long likes;
        private int shares;
        private int comments;

        public String getPostId() { return postId; }
        public void setPostId(String postId) { this.postId = postId; }
        public long getLikes() { return likes; }
        public void setLikes(long likes) { this.likes = likes; }
        public int getShares() { return shares; }
        public void setShares(int shares) { this.shares = shares; }
        public int getComments() { return comments; }
        public void setComments(int comments) { this.comments = comments; }
    }
}

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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final Logger log = LoggerFactory.getLogger(PostController.class);

    @Autowired
    private PostService postService;
    @Autowired
    private org.springframework.web.client.RestTemplate restTemplate;

    @org.springframework.beans.factory.annotation.Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

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
            Map<String, Object> resp = Map.of(
                "success", true,
                "message", "Post created successfully",
                "post", created
            );

            // Enrich response with external details (best-effort)
            try {
                java.util.Map<String, Object> enriched = new java.util.HashMap<>((java.util.Map)resp);
                boolean wasEnriched = false;

                // 1. Attached Song details
                if (created.getSongId() != null && !created.getSongId().isBlank()) {
                    try {
                        Object song = restTemplate.getForObject(apiGatewayUrl + "/api/songs/" + created.getSongId(), Object.class);
                        enriched.put("attachedSong", song instanceof java.util.Map ? ((java.util.Map) song).get("data") : song);
                        wasEnriched = true;
                    } catch (Exception ignored) {}
                }

                // 2. Shared Post details
                if (created.getSharedPostId() != null && !created.getSharedPostId().isBlank()) {
                    try {
                        Object originalPost = restTemplate.getForObject(apiGatewayUrl + "/api/posts/" + created.getSharedPostId(), Object.class);
                        enriched.put("sharedPost", originalPost);
                        wasEnriched = true;
                    } catch (Exception ignored) {}
                }

                if (wasEnriched) return ResponseEntity.ok(enriched);
            } catch (Exception ignored) {}

            return ResponseEntity.ok(resp);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get post by ID
    @GetMapping("/{postId}")
    public ResponseEntity<?> getPost(@PathVariable("postId") String postId) {
        try {
            Post post = postService.getPostById(postId)
                    .orElseThrow(() -> new RuntimeException("Post not found"));
            
            java.util.List<Post> posts = java.util.Collections.singletonList(post);
            try {
                enrichPostsWithSongs(posts);
                enrichPostsWithSharedPosts(posts);
            } catch (Exception ignored) {}
            
            return ResponseEntity.ok(post);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get posts by user
    @GetMapping("/user/{userId}")
        public ResponseEntity<?> getPostsByUser(
            @PathVariable("userId") String userId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.getPostsByUser(userId, pageable);
                // Enrich posts with details (best-effort)
                try {
                    enrichPostsWithSongs(posts.getContent());
                    enrichPostsWithSharedPosts(posts.getContent());
                } catch (Exception ignored) {}
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get feed (posts from followed users)
    @PostMapping("/feed")
        public ResponseEntity<?> getFeed(
            @RequestBody Map<String, List<String>> request,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            List<String> userIds = request.get("userIds");
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.getFeed(userIds, pageable);
                try { 
                    enrichPostsWithSongs(posts.getContent()); 
                    enrichPostsWithSharedPosts(posts.getContent());
                } catch (Exception ignored) {}
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get public posts
    @GetMapping("/public")
        public ResponseEntity<?> getPublicPosts(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Post> posts = postService.getPublicPosts(pageable);
                try { 
                    enrichPostsWithSongs(posts.getContent()); 
                    enrichPostsWithSharedPosts(posts.getContent());
                } catch (Exception ignored) {}
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get trending posts
    @GetMapping("/trending")
        public ResponseEntity<?> getTrendingPosts(
            @RequestParam(value = "days", defaultValue = "0") int days,
            @RequestParam(value = "limit", defaultValue = "20") int limit) {
        try {
            List<Post> posts = postService.getTrendingPosts(days, limit);
                try { 
                    enrichPostsWithSongs(posts); 
                    enrichPostsWithSharedPosts(posts);
                } catch (Exception ignored) {}
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "posts", posts
                ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

        // Helper: best-effort enrich a list of posts by fetching song details for those with songId
        private void enrichPostsWithSongs(java.util.List<Post> posts) {
            if (posts == null || posts.isEmpty()) return;
            java.util.Set<String> ids = new java.util.HashSet<>();
            for (Post p : posts) {
                if (p.getSongId() != null && !p.getSongId().isBlank()) ids.add(p.getSongId());
            }
            if (ids.isEmpty()) return;

            java.util.Map<String, Object> songMap = new java.util.HashMap<>();
            for (String id : ids) {
                try {
                    Object resp = restTemplate.getForObject(apiGatewayUrl + "/api/songs/" + id, Object.class);
                    Object songObj = null;
                    if (resp instanceof java.util.Map<?, ?> m) {
                        Object data = m.get("data");
                        songObj = data != null ? data : m;
                    } else {
                        songObj = resp;
                    }

                    // If the returned song has no artist (or artist is just the uploader id), try to resolve uploader to username
                    try {
                        if (songObj instanceof java.util.Map<?, ?>) {
                            java.util.Map<String, Object> sm = new java.util.HashMap<>((java.util.Map) songObj);
                            Object artistObj = sm.get("artist");
                            Object uploadedBy = sm.get("uploadedBy");
                            String artistStr = artistObj != null ? String.valueOf(artistObj) : null; 

                            // Prefer to resolve by the song's `artist` field when it looks like a user id; otherwise fallback to `uploadedBy`.
                            String idPattern = "^[0-9a-fA-F]{6,}$";
                            String userIdToLookup = null;
                            if (artistStr != null && artistStr.matches(idPattern)) {
                                userIdToLookup = artistStr;
                            } else if (uploadedBy != null) {
                                userIdToLookup = String.valueOf(uploadedBy);
                            }

                            if (userIdToLookup != null) {
                                try {
                                    if (log.isDebugEnabled()) log.debug("Resolving artist for userId={}", userIdToLookup);
                                    Object userResp = restTemplate.getForObject(apiGatewayUrl + "/api/users/" + userIdToLookup, Object.class);
                                    if (userResp instanceof java.util.Map<?, ?>) {
                                        java.util.Map userRespMap = (java.util.Map) userResp;
                                        Object userData = userRespMap.get("data") != null ? userRespMap.get("data") : userRespMap;
                                        if (userData instanceof java.util.Map<?, ?>) {
                                            java.util.Map userDataMap = (java.util.Map) userData;
                                            String found = null;
                                            String[] keys = new String[]{"username", "name", "displayName", "fullName", "firstName", "lastName", "display_name", "userName"};
                                            for (String k : keys) {
                                                try {
                                                    Object v = userDataMap.get(k);
                                                    if (v != null && String.valueOf(v).trim().length() > 0 && !String.valueOf(v).matches(idPattern)) { found = String.valueOf(v).trim(); break; }
                                                } catch (Exception ignore) {}
                                            }
                                            // final fallback: take first non-id string field
                                            if (found == null) {
                                                for (Object entryKey : userDataMap.keySet()) {
                                                    try {
                                                        Object val = userDataMap.get(entryKey);
                                                        if (val instanceof String) {
                                                            String s = ((String) val).trim();
                                                            if (!s.isBlank() && !s.matches(idPattern)) { found = s; break; }
                                                        }
                                                    } catch (Exception ignore) {}
                                                }
                                            }
                                            if (found != null && !found.isBlank()) {
                                                sm.put("artist", found);
                                                if (log.isInfoEnabled()) log.info("Resolved artist name '{}' for user {}", found, userIdToLookup);
                                            } else {
                                                if (log.isDebugEnabled()) log.debug("No display name found for user {}", userIdToLookup);
                                            }
                                        }
                                    }
                                } catch (Exception ignored2) {
                                    if (log.isDebugEnabled()) log.debug("User lookup failed for userId={}", userIdToLookup, ignored2);
                                }
                            }

                            boolean shouldResolve = false;
                            if (artistStr == null && uploadedBy != null) shouldResolve = true;
                            else if (artistStr != null && uploadedBy != null && String.valueOf(uploadedBy).equals(artistStr)) shouldResolve = true;
                            else if (artistStr != null && artistStr.matches("^[0-9a-fA-F]{6,}$")) shouldResolve = true; // looks like an id

                            if (shouldResolve && uploadedBy != null) {
                                try {
                                    Object userResp = restTemplate.getForObject(apiGatewayUrl + "/api/users/" + String.valueOf(uploadedBy), Object.class);
                                    if (userResp instanceof java.util.Map<?, ?>) {
                                        java.util.Map userRespMap = (java.util.Map) userResp;
                                        Object userData = userRespMap.get("data") != null ? userRespMap.get("data") : userRespMap;
                                        if (userData instanceof java.util.Map<?, ?>) {
                                            java.util.Map userDataMap = (java.util.Map) userData;
                                            String found = null;
                                            String[] keys = new String[]{"username", "name", "displayName", "fullName", "firstName", "lastName", "display_name", "userName", "displayName"};
                                            for (String k : keys) {
                                                Object v = userDataMap.get(k);
                                                if (v != null) { found = String.valueOf(v); break; }
                                            }
                                            if (found != null && !found.isBlank()) {
                                                sm.put("artist", found);
                                            } else {
                                                // try to find any string-like field that doesn't look like an id
                                                String candidate = null;
                                                for (Object entryKey : userDataMap.keySet()) {
                                                    try {
                                                        Object val = userDataMap.get(entryKey);
                                                        if (val instanceof String) {
                                                            String s = ((String) val).trim();
                                                            if (!s.isBlank() && !s.matches("^[0-9a-fA-F]{6,}$")) { candidate = s; break; }
                                                        }
                                                    } catch (Exception ignore) {}
                                                }
                                                if (candidate != null) sm.put("artist", candidate);
                                            }
                                        }
                                    }
                                } catch (Exception ignored2) {
                                    // ignore user lookup failures
                                }
                            }
                            songObj = sm;
                        }
                    } catch (Exception ignoredInner) {}

                    if (songObj != null) songMap.put(id, songObj);
                } catch (Exception ignored) {
                    // skip on failure
                }
            }

            for (Post p : posts) {
                if (p.getSongId() != null) {
                    Object song = songMap.get(p.getSongId());
                    if (song != null) p.setAttachedSong(song);
                }
            }
        }

        private void enrichPostsWithSharedPosts(java.util.List<Post> posts) {
            if (posts == null || posts.isEmpty()) return;
            java.util.Set<String> sharedIds = new java.util.HashSet<>();
            for (Post p : posts) {
                if (p.getSharedPostId() != null && !p.getSharedPostId().isBlank()) sharedIds.add(p.getSharedPostId());
            }
            if (sharedIds.isEmpty()) return;

            java.util.Map<String, Object> sharedMap = new java.util.HashMap<>();
            for (String id : sharedIds) {
                try {
                    Object originalPost = restTemplate.getForObject(apiGatewayUrl + "/api/posts/" + id, Object.class);
                    if (originalPost != null) sharedMap.put(id, originalPost);
                } catch (Exception ignored) {}
            }

            for (Post p : posts) {
                if (p.getSharedPostId() != null) {
                    Object original = sharedMap.get(p.getSharedPostId());
                    if (original != null) p.setSharedPost(original);
                }
            }
        }

    // Update post
    @PutMapping("/{postId}")
        public ResponseEntity<?> updatePost(
            @PathVariable("postId") String postId,
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
            @PathVariable("postId") String postId,
            @RequestParam("userId") String userId) {
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
            @PathVariable("postId") String postId,
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
            @PathVariable("postId") String postId,
            @RequestParam("userId") String userId) {
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
            @PathVariable("postId") String postId,
            @RequestParam("userId") String userId) {
        try {
            boolean liked = postService.isPostLikedByUser(postId, userId);
            return ResponseEntity.ok(Map.of("liked", liked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get post likes
    @GetMapping("/{postId}/likes")
    public ResponseEntity<?> getPostLikes(@PathVariable("postId") String postId) {
        try {
            List<PostLike> likes = postService.getPostLikes(postId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Share post
    @PostMapping("/{postId}/share")
    public ResponseEntity<?> sharePost(
            @PathVariable("postId") String postId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String userId = request == null ? null : request.get("userId");
            postService.sharePost(postId, userId);
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
            @RequestParam("query") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
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
    public ResponseEntity<?> getPostStatistics(@PathVariable("postId") String postId) {
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
            @RequestParam("query") String query,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
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
            @RequestParam("latitude") Double latitude,
            @RequestParam("longitude") Double longitude,
            @RequestParam(value = "radiusKm", defaultValue = "10.0") Double radiusKm,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
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

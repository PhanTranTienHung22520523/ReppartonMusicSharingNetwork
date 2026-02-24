package com.DA2.socialservice.controller;

import com.DA2.socialservice.entity.Like;
import com.DA2.socialservice.entity.Share;
import com.DA2.socialservice.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/social")
@CrossOrigin(origins = "*")
public class SocialController {

    @Autowired
    private SocialService socialService;

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Social Service is running");
    }

    // FOLLOW ENDPOINTS
    @PostMapping("/follow")
    public ResponseEntity<?> followUser(@RequestBody Map<String, String> request) {
        try {
            String followerId = requireAuthenticatedUserId();
            String followingId = request.get("followingId");
            socialService.followUser(followerId, followingId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse(e));
        }
    }

    @DeleteMapping("/follow")
    public ResponseEntity<?> unfollowUser(
            @RequestParam(value = "followerId", required = false) String ignoredFollowerId,
            @RequestParam("followingId") String followingId) {
        try {
            String followerId = requireAuthenticatedUserId();
            socialService.unfollowUser(followerId, followingId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse(e));
        }
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getFollowing(@PathVariable("userId") String userId) {
        try {
            // Return user details instead of just IDs
            List<?> following = socialService.getFollowingWithDetails(userId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorOnlyResponse(e));
        }
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getFollowers(@PathVariable("userId") String userId) {
        try {
            // Return user details instead of just IDs
            List<?> followers = socialService.getFollowersWithDetails(userId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorOnlyResponse(e));
        }
    }

    @GetMapping("/is-following")
    public ResponseEntity<?> isFollowing(
            @RequestParam("followerId") String followerId,
            @RequestParam("followingId") String followingId) {
        try {
            boolean following = socialService.isFollowing(followerId, followingId);
            return ResponseEntity.ok(Map.of("following", following));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorOnlyResponse(e));
        }
    }

    private Map<String, Object> errorResponse(Exception e) {
        Map<String, Object> body = new HashMap<>();
        body.put("success", false);
        body.put("message", safeMessage(e));
        return body;
    }

    private Map<String, Object> errorOnlyResponse(Exception e) {
        Map<String, Object> body = new HashMap<>();
        body.put("error", safeMessage(e));
        return body;
    }

    private String safeMessage(Exception e) {
        if (e == null) {
            return "Unknown error";
        }
        String msg = e.getMessage();
        if (msg == null || msg.isBlank()) {
            return e.getClass().getSimpleName();
        }
        return msg;
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable("userId") String userId) {
        try {
            long followersCount = socialService.getFollowersCount(userId);
            long followingCount = socialService.getFollowingCount(userId);
            return ResponseEntity.ok(Map.of(
                "followers", followersCount,
                "following", followingCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // LIKE ENDPOINTS
    @PostMapping("/like")
    public ResponseEntity<?> likeItem(@RequestBody Map<String, String> request) {
        try {
            String userId = requireAuthenticatedUserId();
            String itemId = request.get("itemId");
            String itemType = request.get("itemType");
            boolean created = socialService.likeItem(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("success", true, "liked", true, "created", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/like")
    public ResponseEntity<?> unlikeItem(
            @RequestParam(value = "userId", required = false) String ignoredUserId,
            @RequestParam("itemId") String itemId,
            @RequestParam("itemType") String itemType) {
        try {
            String userId = requireAuthenticatedUserId();
            boolean deleted = socialService.unlikeItem(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("success", true, "liked", false, "deleted", deleted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/is-liked")
    public ResponseEntity<?> isLiked(
            @RequestParam(value = "userId", required = false) String ignoredUserId,
            @RequestParam("itemId") String itemId,
            @RequestParam("itemType") String itemType) {
        try {
            String userId = requireAuthenticatedUserId();
            boolean liked = socialService.isLiked(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("liked", liked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/likes/count")
    public ResponseEntity<?> getLikesCount(
            @RequestParam("itemId") String itemId,
            @RequestParam("itemType") String itemType) {
        try {
            long count = socialService.getLikesCount(itemId, itemType);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/likes/user/{userId}")
    public ResponseEntity<?> getUserLikes(@PathVariable("userId") String userId) {
        try {
            String actorUserId = requireAuthenticatedUserId();
            if (!actorUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
            }
            List<Like> likes = socialService.getUserLikes(userId);
            return ResponseEntity.ok(likes);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // SHARE ENDPOINTS
    @PostMapping("/share")
    public ResponseEntity<?> shareItem(@RequestBody Map<String, String> request) {
        try {
            String userId = requireAuthenticatedUserId();
            String itemId = request.get("itemId");
            String itemType = request.get("itemType");
            socialService.shareItem(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private String requireAuthenticatedUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new RuntimeException("Unauthorized");
        }
        String userId = String.valueOf(auth.getPrincipal());
        if (userId.isBlank() || "anonymousUser".equalsIgnoreCase(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        return userId;
    }

    @GetMapping("/shares/count")
    public ResponseEntity<?> getSharesCount(
            @RequestParam("itemId") String itemId,
            @RequestParam("itemType") String itemType) {
        try {
            long count = socialService.getSharesCount(itemId, itemType);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/shares/user/{userId}")
    public ResponseEntity<?> getUserShares(@PathVariable("userId") String userId) {
        try {
            String actorUserId = requireAuthenticatedUserId();
            if (!actorUserId.equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
            }
            List<Share> shares = socialService.getUserShares(userId);
            return ResponseEntity.ok(shares);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

package com.DA2.socialservice.controller;

import com.DA2.socialservice.entity.Like;
import com.DA2.socialservice.entity.Share;
import com.DA2.socialservice.service.SocialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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
            String followerId = request.get("followerId");
            String followingId = request.get("followingId");
            socialService.followUser(followerId, followingId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/follow")
    public ResponseEntity<?> unfollowUser(
            @RequestParam String followerId,
            @RequestParam String followingId) {
        try {
            socialService.unfollowUser(followerId, followingId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/following/{userId}")
    public ResponseEntity<?> getFollowing(@PathVariable String userId) {
        try {
            List<String> following = socialService.getFollowing(userId);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/followers/{userId}")
    public ResponseEntity<?> getFollowers(@PathVariable String userId) {
        try {
            List<String> followers = socialService.getFollowers(userId);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/is-following")
    public ResponseEntity<?> isFollowing(
            @RequestParam String followerId,
            @RequestParam String followingId) {
        try {
            boolean following = socialService.isFollowing(followerId, followingId);
            return ResponseEntity.ok(Map.of("following", following));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats/{userId}")
    public ResponseEntity<?> getUserStats(@PathVariable String userId) {
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
            String userId = request.get("userId");
            String itemId = request.get("itemId");
            String itemType = request.get("itemType");
            socialService.likeItem(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @DeleteMapping("/like")
    public ResponseEntity<?> unlikeItem(
            @RequestParam String userId,
            @RequestParam String itemId,
            @RequestParam String itemType) {
        try {
            socialService.unlikeItem(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/is-liked")
    public ResponseEntity<?> isLiked(
            @RequestParam String userId,
            @RequestParam String itemId,
            @RequestParam String itemType) {
        try {
            boolean liked = socialService.isLiked(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("liked", liked));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/likes/count")
    public ResponseEntity<?> getLikesCount(
            @RequestParam String itemId,
            @RequestParam String itemType) {
        try {
            long count = socialService.getLikesCount(itemId, itemType);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/likes/user/{userId}")
    public ResponseEntity<?> getUserLikes(@PathVariable String userId) {
        try {
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
            String userId = request.get("userId");
            String itemId = request.get("itemId");
            String itemType = request.get("itemType");
            socialService.shareItem(userId, itemId, itemType);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/shares/count")
    public ResponseEntity<?> getSharesCount(
            @RequestParam String itemId,
            @RequestParam String itemType) {
        try {
            long count = socialService.getSharesCount(itemId, itemType);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/shares/user/{userId}")
    public ResponseEntity<?> getUserShares(@PathVariable String userId) {
        try {
            List<Share> shares = socialService.getUserShares(userId);
            return ResponseEntity.ok(shares);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

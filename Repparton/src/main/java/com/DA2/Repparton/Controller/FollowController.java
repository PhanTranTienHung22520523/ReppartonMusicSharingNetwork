package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.FollowService;
import com.DA2.Repparton.Service.UserService;
import com.DA2.Repparton.Entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/follow")
@CrossOrigin(origins = "*")
public class FollowController {

    @Autowired
    private FollowService followService;
    
    @Autowired
    private UserService userService;

    @PostMapping("/{artistId}")
    public ResponseEntity<?> followUser(@PathVariable String artistId, Authentication auth) {
        try {
            String followerId = getCurrentUserId(auth);
            if (followerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Authentication required"
                ));
            }
            
            boolean success = followService.followUser(followerId, artistId);

            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User followed successfully",
                    "followerCount", followService.getFollowerCount(artistId)
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to follow user"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{artistId}")
    public ResponseEntity<?> unfollowUser(@PathVariable String artistId, Authentication auth) {
        try {
            String followerId = getCurrentUserId(auth);
            if (followerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Authentication required"
                ));
            }
            
            boolean success = followService.unfollowUser(followerId, artistId);

            if (success) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User unfollowed successfully",
                    "followerCount", followService.getFollowerCount(artistId)
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to unfollow user"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{artistId}/check")
    public ResponseEntity<?> checkFollowStatus(@PathVariable String artistId, Authentication auth) {
        try {
            String followerId = getCurrentUserId(auth);
            if (followerId == null) {
                return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "Authentication required"
                ));
            }
            
            boolean isFollowing = followService.isFollowing(followerId, artistId);
            long followerCount = followService.getFollowerCount(artistId);

            return ResponseEntity.ok(Map.of(
                "isFollowing", isFollowing,
                "followerCount", followerCount
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    private String getCurrentUserId(Authentication auth) {
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName(); // Get username from JWT
            // Find user by username/email and get ID
            User user = userService.findByEmail(username);
            if (user != null) {
                return user.getId();
            }
        }
        return null;
    }
}

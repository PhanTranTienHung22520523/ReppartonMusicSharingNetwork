package com.DA2.userservice.controller;

import com.DA2.userservice.dto.PublicUserDTO;
import com.DA2.userservice.dto.UpdateUserProfileRequest;
import com.DA2.userservice.dto.UpdateUserSettingsRequest;
import com.DA2.userservice.dto.UserProfileResponse;
import com.DA2.userservice.dto.UserResponse;
import com.DA2.userservice.dto.UserSettingsDto;
import com.DA2.userservice.service.ImageUploadService;
import com.DA2.userservice.service.UserProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import jakarta.annotation.security.PermitAll;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserProfileService userProfileService;
    private final ImageUploadService imageUploadService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(userProfileService.getUserById(userId));
    }

    @GetMapping("/public/{userId}")
    @PermitAll
    public ResponseEntity<PublicUserDTO> getPublicUserById(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(userProfileService.getPublicUserById(userId));
    }

    @GetMapping("/{userId}/profile")
    @PermitAll
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(userProfileService.getUserProfile(userId));
    }

    @PutMapping("/{userId}/profile")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable("userId") String userId,
            @RequestBody UpdateUserProfileRequest request) {
        return ResponseEntity.ok(userProfileService.updateUserProfile(userId, request));
    }

    @GetMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> getUserSettings(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(userProfileService.getUserSettings(userId));
    }

    @PutMapping("/{userId}/settings")
    public ResponseEntity<UserSettingsDto> updateUserSettings(
            @PathVariable("userId") String userId,
            @RequestBody UpdateUserSettingsRequest request) {
        return ResponseEntity.ok(userProfileService.updateUserSettings(userId, request));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable("userId") String userId) {
        userProfileService.deleteUser(userId);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "User deleted successfully"
        ));
    }

    @GetMapping
        public ResponseEntity<Page<UserResponse>> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        int pageNumber = Math.max(page, 0);
        int pageSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(userProfileService.getAllUsers(pageable));
    }

    @GetMapping("/search")
    @PermitAll
        public ResponseEntity<Page<UserResponse>> searchUsers(
            @RequestParam(value = "q", required = false) String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        int pageNumber = Math.max(page, 0);
        int pageSize = Math.max(1, Math.min(size, 100));
        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return ResponseEntity.ok(userProfileService.searchUsers(keyword, pageable));
    }

    @PostMapping("/{userId}/upload-avatar")
    public ResponseEntity<?> uploadAvatar(
            @PathVariable("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageUploadService.uploadAvatar(file);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "imageUrl", imageUrl,
                    "message", "Avatar uploaded successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to upload avatar: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{userId}/upload-cover")
    public ResponseEntity<?> uploadCover(
            @PathVariable("userId") String userId,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = imageUploadService.uploadCover(file);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "imageUrl", imageUrl,
                    "message", "Cover image uploaded successfully"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Failed to upload cover: " + e.getMessage()
            ));
        }
    }

    // Block user
    @PostMapping("/{targetUserId}/block")
    public ResponseEntity<?> blockUser(
            @PathVariable("targetUserId") String targetUserId,
            @RequestParam("userId") String currentUserId) {
        try {
            userProfileService.blockUser(currentUserId, targetUserId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User blocked successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // Unblock user
    @DeleteMapping("/{targetUserId}/block")
    public ResponseEntity<?> unblockUser(
            @PathVariable("targetUserId") String targetUserId,
            @RequestParam("userId") String currentUserId) {
        try {
            userProfileService.unblockUser(currentUserId, targetUserId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "User unblocked successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // Get blocked users list
    @GetMapping("/blocked")
    public ResponseEntity<?> getBlockedUsers(@RequestParam("userId") String userId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "blockedUsers", userProfileService.getBlockedUsers(userId)
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // Check if user is blocked
    @GetMapping("/{targetUserId}/blocked")
    public ResponseEntity<?> isUserBlocked(
            @PathVariable("targetUserId") String targetUserId,
            @RequestParam("userId") String currentUserId) {
        try {
            boolean isBlocked = userProfileService.isUserBlocked(currentUserId, targetUserId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "isBlocked", isBlocked
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    // Update artist messaging settings
    @PutMapping("/{userId}/messaging-settings")
    public ResponseEntity<?> updateMessagingSettings(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, Boolean> settings) {
        try {
            boolean allowNormalUserMessages = settings.getOrDefault("allowNormalUserMessages", false);
            userProfileService.updateMessagingSettings(userId, allowNormalUserMessages);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Messaging settings updated successfully",
                    "allowNormalUserMessages", allowNormalUserMessages
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    // Get artist messaging settings
    @GetMapping("/{userId}/messaging-settings")
    public ResponseEntity<?> getMessagingSettings(@PathVariable("userId") String userId) {
        try {
            boolean allowNormalUserMessages = userProfileService.getAllowNormalUserMessages(userId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "allowNormalUserMessages", allowNormalUserMessages
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // Update onboarding status
    @PostMapping("/{userId}/onboarding")
    public ResponseEntity<?> updateOnboardingStatus(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, Object> payload) {
        try {
            java.util.List<String> preferredGenres = (java.util.List<String>) payload.get("preferredGenres");
            userProfileService.updateOnboardingStatus(userId, preferredGenres);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Onboarding completed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
    
    // Update user's preferred genres (for adaptive learning)
    @PutMapping("/{userId}/preferred-genres")
    public ResponseEntity<?> updatePreferredGenres(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<String> genres = (java.util.List<String>) request.get("preferredGenres");
            
            if (genres == null || genres.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "preferredGenres list is required"
                ));
            }
            
            userProfileService.updatePreferredGenres(userId, genres);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Preferred genres updated successfully",
                "preferredGenres", genres
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }
}


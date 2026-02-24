package com.DA2.userservice.service;

import com.DA2.userservice.dto.PublicUserDTO;
import com.DA2.userservice.dto.UpdateUserSettingsRequest;
import com.DA2.userservice.dto.UpdateUserProfileRequest;
import com.DA2.userservice.dto.UserSettingsDto;
import com.DA2.userservice.dto.UserProfileResponse;
import com.DA2.userservice.dto.UserResponse;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserRepository userRepository;

    public UserResponse getUserById(String userId) {
        User user = findUserByIdOrUsername(userId);
        return UserResponse.fromEntity(user);
    }

    public PublicUserDTO getPublicUserById(String userId) {
        User user = findUserByIdOrUsername(userId);
        return PublicUserDTO.fromEntity(user);
    }

    public UserProfileResponse getUserProfile(String userId) {
        User user = findUserByIdOrUsername(userId);

        return UserProfileResponse.builder()
                .user(UserResponse.fromEntity(user))
                .followerNumber(user.getFollowersCount())
                .followingNumber(user.getFollowingCount())
                .postsCount(0)
                .songsCount(0)
                .build();
    }

    private User findUserByIdOrUsername(String key) {
        Optional<User> opt = userRepository.findById(key);
        if (opt.isEmpty()) {
            opt = userRepository.findByUsername(key);
        }
        return opt.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    public UserProfileResponse updateUserProfile(String userId, UpdateUserProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }

        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }
        if (request.getAvatarUrl() != null) {
            user.setAvatarUrl(request.getAvatarUrl());
        }
        if (request.getCoverUrl() != null) {
            user.setCoverUrl(request.getCoverUrl());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getWebsite() != null) {
            user.setWebsite(request.getWebsite());
        }

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return getUserProfile(userId);
    }

    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        Page<User> page;
        if (keyword == null || keyword.isBlank()) {
            page = userRepository.findAll(pageable);
        } else {
            page = userRepository.searchUsers(keyword.toLowerCase(), pageable);
        }

        List<UserResponse> responses = page.getContent()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        List<UserResponse> responses = page.getContent()
                .stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }

    // Block user
    public void blockUser(String currentUserId, String targetUserId) {
        if (currentUserId.equals(targetUserId)) {
            throw new RuntimeException("Cannot block yourself");
        }

        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        User targetUser = userRepository.findById(targetUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Target user not found"));

        if (currentUser.getBlockedUsers() == null) {
            currentUser.setBlockedUsers(new java.util.ArrayList<>());
        }

        if (!currentUser.getBlockedUsers().contains(targetUserId)) {
            currentUser.getBlockedUsers().add(targetUserId);
            currentUser.setUpdatedAt(LocalDateTime.now());
            userRepository.save(currentUser);
        }
    }

    // Unblock user
    public void unblockUser(String currentUserId, String targetUserId) {
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Current user not found"));

        if (currentUser.getBlockedUsers() != null && currentUser.getBlockedUsers().contains(targetUserId)) {
            currentUser.getBlockedUsers().remove(targetUserId);
            currentUser.setUpdatedAt(LocalDateTime.now());
            userRepository.save(currentUser);
        }
    }

    // Get blocked users
    public List<UserResponse> getBlockedUsers(String userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user.getBlockedUsers() == null || user.getBlockedUsers().isEmpty()) {
            return new java.util.ArrayList<>();
        }

        return user.getBlockedUsers().stream()
                .map(blockedUserId -> {
                    try {
                        User blockedUser = userRepository.findById(blockedUserId).orElse(null);
                        return blockedUser != null ? UserResponse.fromEntity(blockedUser) : null;
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(response -> response != null)
                .collect(Collectors.toList());
    }

    // Check if user is blocked
    public boolean isUserBlocked(String currentUserId, String targetUserId) {
        User currentUser = userRepository.findById(currentUserId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        return currentUser.getBlockedUsers() != null && 
               currentUser.getBlockedUsers().contains(targetUserId);
    }
    
    // Update artist messaging settings
    public void updateMessagingSettings(String userId, boolean allowNormalUserMessages) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Only artists can change this setting
        if (!"ARTIST".equalsIgnoreCase(user.getRole())) {
            throw new RuntimeException("Only artists can change messaging settings");
        }
        
        user.setAllowNormalUserMessages(allowNormalUserMessages);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
    
    // Get artist messaging settings
    public boolean getAllowNormalUserMessages(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.isAllowNormalUserMessages();
    }

    public void updateOnboardingStatus(String userId, List<String> preferredGenres) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setOnboarded(true);
        user.setPreferredGenres(preferredGenres != null ? preferredGenres : new java.util.ArrayList<>());
        user.setUpdatedAt(LocalDateTime.now());
        
        userRepository.save(user);
    }

    public UserSettingsDto getUserSettings(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ensureSettingsInitialized(user);
        return UserSettingsDto.fromEntity(user.getSettings());
    }

    public UserSettingsDto updateUserSettings(String userId, UpdateUserSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        ensureSettingsInitialized(user);

        User.UserSettings settings = user.getSettings();

        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }
        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }

        if (request.getNotifications() != null) {
            if (settings.getNotifications() == null) {
                settings.setNotifications(User.Notifications.builder().build());
            }
            UpdateUserSettingsRequest.Notifications n = request.getNotifications();
            if (n.getLikes() != null) settings.getNotifications().setLikes(n.getLikes());
            if (n.getComments() != null) settings.getNotifications().setComments(n.getComments());
            if (n.getFollowers() != null) settings.getNotifications().setFollowers(n.getFollowers());
            if (n.getNewMusic() != null) settings.getNotifications().setNewMusic(n.getNewMusic());
            if (n.getEmail() != null) settings.getNotifications().setEmail(n.getEmail());
            if (n.getPush() != null) settings.getNotifications().setPush(n.getPush());
        }

        if (request.getPrivacy() != null) {
            if (settings.getPrivacy() == null) {
                settings.setPrivacy(User.Privacy.builder().build());
            }
            UpdateUserSettingsRequest.Privacy p = request.getPrivacy();
            if (p.getPublicProfile() != null) settings.getPrivacy().setPublicProfile(p.getPublicProfile());
            if (p.getShowActivity() != null) settings.getPrivacy().setShowActivity(p.getShowActivity());
            if (p.getPublicPlaylists() != null) settings.getPrivacy().setPublicPlaylists(p.getPublicPlaylists());
            if (p.getWhoCanMsg() != null) settings.getPrivacy().setWhoCanMsg(p.getWhoCanMsg());
        }

        if (request.getAudio() != null) {
            if (settings.getAudio() == null) {
                settings.setAudio(User.Audio.builder().build());
            }
            UpdateUserSettingsRequest.Audio a = request.getAudio();
            if (a.getQuality() != null) settings.getAudio().setQuality(a.getQuality());
            if (a.getAutoplay() != null) settings.getAudio().setAutoplay(a.getAutoplay());
            if (a.getCrossfade() != null) settings.getAudio().setCrossfade(a.getCrossfade());
            if (a.getVolume() != null) settings.getAudio().setVolume(Math.max(0, Math.min(100, a.getVolume())));
            if (a.getFadeInDuration() != null) settings.getAudio().setFadeInDuration(Math.max(1, Math.min(10, a.getFadeInDuration())));
        }

        if (request.getInterfaceSettings() != null) {
            if (settings.getInterfaceSettings() == null) {
                settings.setInterfaceSettings(User.InterfaceSettings.builder().build());
            }
            UpdateUserSettingsRequest.InterfaceSettings i = request.getInterfaceSettings();
            if (i.getShowWaveform() != null) settings.getInterfaceSettings().setShowWaveform(i.getShowWaveform());
            if (i.getShowLyrics() != null) settings.getInterfaceSettings().setShowLyrics(i.getShowLyrics());
            if (i.getCompactMode() != null) settings.getInterfaceSettings().setCompactMode(i.getCompactMode());
            if (i.getAnimationsEnabled() != null) settings.getInterfaceSettings().setAnimationsEnabled(i.getAnimationsEnabled());
        }

        user.setSettings(settings);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return UserSettingsDto.fromEntity(user.getSettings());
    }

    public void deleteUser(String userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        }
        userRepository.deleteById(userId);
    }

    private void ensureSettingsInitialized(User user) {
        if (user.getSettings() == null) {
            user.setSettings(User.UserSettings.builder().build());
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
            return;
        }

        // Ensure nested defaults exist (older docs may have partial settings)
        User.UserSettings settings = user.getSettings();
        boolean changed = false;
        if (settings.getNotifications() == null) {
            settings.setNotifications(User.Notifications.builder().build());
            changed = true;
        }
        if (settings.getPrivacy() == null) {
            settings.setPrivacy(User.Privacy.builder().build());
            changed = true;
        }
        if (settings.getAudio() == null) {
            settings.setAudio(User.Audio.builder().build());
            changed = true;
        }
        if (settings.getInterfaceSettings() == null) {
            settings.setInterfaceSettings(User.InterfaceSettings.builder().build());
            changed = true;
        }

        if (changed) {
            user.setSettings(settings);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);
        }
    }
    
    /**
     * Update user's preferred genres (for adaptive learning).
     * Merges with existing preferences to avoid overwriting survey data.
     */
    public void updatePreferredGenres(String userId, List<String> newGenres) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        
        // Merge with existing genres (keep unique values)
        List<String> existingGenres = user.getPreferredGenres();
        if (existingGenres == null) {
            existingGenres = new java.util.ArrayList<>();
        }
        
        // Combine and deduplicate
        java.util.Set<String> mergedGenres = new java.util.LinkedHashSet<>();
        mergedGenres.addAll(existingGenres); // Keep existing (from survey)
        mergedGenres.addAll(newGenres); // Add learned genres
        
        // Limit to top 7 genres
        List<String> finalGenres = mergedGenres.stream()
            .limit(7)
            .collect(Collectors.toList());
        
        user.setPreferredGenres(finalGenres);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}

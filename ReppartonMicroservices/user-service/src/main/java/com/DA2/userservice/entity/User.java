package com.DA2.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String passwordHash;
    private String firstName;
    private String lastName;
    private String fullName;
    private String displayName;
    private String avatarUrl;
    private String coverUrl;
    private String bio;
    private String website;
    @Builder.Default
    private String role = "USER";
    @Builder.Default
    private boolean isVerified = false;
    @Builder.Default
    private boolean isArtistPending = false;
    @Builder.Default
    private int followersCount = 0;
    @Builder.Default
    private int followingCount = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Email verification
    @Builder.Default
    private boolean isEmailVerified = false;
    
    // Artist verification
    private ArtistVerification artistVerification;
    
    // Admin fields
    @Builder.Default
    private boolean isBanned = false;
    private String banReason;
    private LocalDateTime bannedAt;
    private String bannedBy;
    private LocalDateTime lastLoginAt;
    @Builder.Default
    private java.util.List<String> roles = java.util.Arrays.asList("USER");
    
    // Block/Unblock users
    @Builder.Default
    private java.util.List<String> blockedUsers = new java.util.ArrayList<>();
    
    // Onboarding & Preferences
    @Builder.Default
    private boolean isOnboarded = false;
    
    @Builder.Default
    private java.util.List<String> preferredGenres = new java.util.ArrayList<>();
    
    // Artist messaging settings - Allow normal users to send direct messages
    @Builder.Default
    private boolean allowNormalUserMessages = false; // Default: Artists don't allow normal user messages

    // User settings/preferences (persisted)
    @Builder.Default
    private UserSettings settings = UserSettings.builder().build();

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = "USER";
        this.roles = java.util.Arrays.asList("USER");
        this.isVerified = false;
        this.isArtistPending = false;
        this.followersCount = 0;
        this.followingCount = 0;
        this.createdAt = LocalDateTime.now();
        updateFullName();
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
        updateFullName();
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
        updateFullName();
    }

    private void updateFullName() {
        if (displayName != null && !displayName.isBlank()) {
            this.fullName = displayName;
        } else if (firstName != null && lastName != null) {
            this.fullName = firstName + " " + lastName;
        } else if (firstName != null) {
            this.fullName = firstName;
        } else if (lastName != null) {
            this.fullName = lastName;
        } else {
            this.fullName = username;
        }
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
        updateFullName();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSettings {
        @Builder.Default
        private String language = "en";
        @Builder.Default
        private String theme = "light";
        @Builder.Default
        private Notifications notifications = Notifications.builder().build();
        @Builder.Default
        private Privacy privacy = Privacy.builder().build();
        @Builder.Default
        private Audio audio = Audio.builder().build();
        @Builder.Default
        private InterfaceSettings interfaceSettings = InterfaceSettings.builder().build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Notifications {
        @Builder.Default
        private boolean likes = true;
        @Builder.Default
        private boolean comments = true;
        @Builder.Default
        private boolean followers = true;
        @Builder.Default
        private boolean newMusic = true;
        @Builder.Default
        private boolean email = false;
        @Builder.Default
        private boolean push = true;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Privacy {
        @Builder.Default
        private boolean publicProfile = true;
        @Builder.Default
        private boolean showActivity = true;
        @Builder.Default
        private boolean publicPlaylists = true;
        @Builder.Default
        private String whoCanMsg = "everyone"; // everyone | friends | noone
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Audio {
        @Builder.Default
        private String quality = "high"; // high | medium | low
        @Builder.Default
        private boolean autoplay = true;
        @Builder.Default
        private boolean crossfade = false;
        @Builder.Default
        private int volume = 75; // 0 - 100
        @Builder.Default
        private int fadeInDuration = 3; // seconds
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InterfaceSettings {
        @Builder.Default
        private boolean showWaveform = true;
        @Builder.Default
        private boolean showLyrics = true;
        @Builder.Default
        private boolean compactMode = false;
        @Builder.Default
        private boolean animationsEnabled = true;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistVerification {
        private String status; // "pending", "approved", "rejected"
        private String submittedDocumentUrl; // ID, certificate, etc.
        private String artistName;
        private String genre;
        private String socialMediaLinks; // JSON string
        private Integer verifiedSongsCount;
        private Double aiConfidenceScore; // 0.0 - 1.0
        private String rejectionReason;
        private LocalDateTime submittedAt;
        private LocalDateTime reviewedAt;
        private String reviewedBy; // Admin ID
    }
}


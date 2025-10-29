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
    private String avatarUrl;
    private String coverUrl;
    private String bio;
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
    
    // Artist verification
    private ArtistVerification artistVerification;

    public User(String username, String email, String passwordHash) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = "USER";
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
        if (firstName != null && lastName != null) {
            this.fullName = firstName + " " + lastName;
        } else if (firstName != null) {
            this.fullName = firstName;
        } else if (lastName != null) {
            this.fullName = lastName;
        } else {
            this.fullName = username;
        }
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


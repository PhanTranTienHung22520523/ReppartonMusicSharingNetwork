package com.DA2.userservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_analytics")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserAnalytics {

    @Id
    @Column(name = "user_id")
    private String userId;

    @Column(name = "followers_count")
    private Integer followersCount = 0;

    @Column(name = "following_count")
    private Integer followingCount = 0;

    @Column(name = "posts_count")
    private Integer postsCount = 0;

    @Column(name = "likes_received_count")
    private Integer likesReceivedCount = 0;

    @Column(name = "comments_received_count")
    private Integer commentsReceivedCount = 0;

    @Column(name = "shares_received_count")
    private Integer sharesReceivedCount = 0;

    @Column(name = "total_plays_count")
    private Integer totalPlaysCount = 0;

    @Column(name = "login_count")
    private Integer loginCount = 0;

    @Column(name = "last_login_timestamp")
    private LocalDateTime lastLoginTimestamp;

    @Column(name = "account_created_timestamp")
    private LocalDateTime accountCreatedTimestamp;

    @Column(name = "is_artist")
    private Boolean isArtist = false;

    @Column(name = "artist_verification_status")
    private String artistVerificationStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
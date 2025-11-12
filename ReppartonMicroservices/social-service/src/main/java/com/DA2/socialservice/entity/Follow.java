package com.DA2.socialservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "follows")
public class Follow {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String followerId; // User who follows

    @Column(nullable = false)
    private String followingId; // User being followed

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Follow() {
        this.createdAt = LocalDateTime.now();
    }

    public Follow(String followerId, String followingId) {
        this();
        this.followerId = followerId;
        this.followingId = followingId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getFollowerId() { return followerId; }
    public void setFollowerId(String followerId) { this.followerId = followerId; }
    
    public String getFollowingId() { return followingId; }
    public void setFollowingId(String followingId) { this.followingId = followingId; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

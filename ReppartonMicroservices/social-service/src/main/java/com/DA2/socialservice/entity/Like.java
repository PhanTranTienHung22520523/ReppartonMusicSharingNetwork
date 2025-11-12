package com.DA2.socialservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "likes")
public class Like {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String itemId; // song, post, comment, etc.

    @Column(nullable = false)
    private String itemType; // "song", "post", "comment"

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Like() {
        this.createdAt = LocalDateTime.now();
    }

    public Like(String userId, String itemId, String itemType) {
        this();
        this.userId = userId;
        this.itemId = itemId;
        this.itemType = itemType;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getItemId() { return itemId; }
    public void setItemId(String itemId) { this.itemId = itemId; }
    
    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

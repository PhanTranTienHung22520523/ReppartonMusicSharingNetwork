package com.DA2.socialservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "shares")
public class Share {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String itemId; // song, post, playlist

    @Column(nullable = false)
    private String itemType; // "song", "post", "playlist"

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public Share() {
        this.createdAt = LocalDateTime.now();
    }

    public Share(String userId, String itemId, String itemType) {
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

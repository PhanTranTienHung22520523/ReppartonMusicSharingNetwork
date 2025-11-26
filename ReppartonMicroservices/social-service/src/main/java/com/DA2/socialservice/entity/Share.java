package com.DA2.socialservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "shares")
public class Share {
    @Id
    private String id;

    private String userId;

    private String itemId; // song, post, playlist

    private String itemType; // "song", "post", "playlist"

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

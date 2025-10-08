package com.DA2.analyticsservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "listen_history")
public class ListenHistory {
    @Id
    private String id;
    private String userId;
    private String songId;
    private LocalDateTime createdAt;

    public ListenHistory() {
        this.createdAt = LocalDateTime.now();
    }

    public ListenHistory(String userId, String songId) {
        this.userId = userId;
        this.songId = songId;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
package com.DA2.playlistservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "playlist_followers")
public class PlaylistFollower {
    @Id
    private String id;

    private String playlistId;

    private String userId;

    private LocalDateTime createdAt;

    public PlaylistFollower() {
        this.createdAt = LocalDateTime.now();
    }

    public PlaylistFollower(String playlistId, String userId) {
        this();
        this.playlistId = playlistId;
        this.userId = userId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(String playlistId) {
        this.playlistId = playlistId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

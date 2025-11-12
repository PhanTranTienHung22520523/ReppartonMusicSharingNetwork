package com.DA2.playlistservice.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "playlists")
public class Playlist {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String userId;

    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    private String coverUrl;

    @ElementCollection
    @CollectionTable(name = "playlist_songs", joinColumns = @JoinColumn(name = "playlist_id"))
    @Column(name = "song_id")
    private List<String> songIds;

    @Column(nullable = false)
    private boolean isPrivate = false;

    @Column(nullable = false)
    private int followers = 0;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public Playlist() {
        this.createdAt = LocalDateTime.now();
        this.songIds = new ArrayList<>();
        this.isPrivate = false;
        this.followers = 0;
    }

    public Playlist(String userId, String name, String description) {
        this();
        this.userId = userId;
        this.name = name;
        this.description = description;
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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverUrl() {
        return coverUrl;
    }

    public void setCoverUrl(String coverUrl) {
        this.coverUrl = coverUrl;
    }

    public List<String> getSongIds() {
        return songIds;
    }

    public void setSongIds(List<String> songIds) {
        this.songIds = songIds;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public int getFollowers() {
        return followers;
    }

    public void setFollowers(int followers) {
        this.followers = followers;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Helper methods
    public void addSong(String songId) {
        if (this.songIds == null) {
            this.songIds = new ArrayList<>();
        }
        if (!this.songIds.contains(songId)) {
            this.songIds.add(songId);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void removeSong(String songId) {
        if (this.songIds != null) {
            this.songIds.remove(songId);
            this.updatedAt = LocalDateTime.now();
        }
    }

    public void incrementFollowers() {
        this.followers++;
    }

    public void decrementFollowers() {
        if (this.followers > 0) {
            this.followers--;
        }
    }
}

package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "playlists")
public class Playlist {
    @Id
    private String id;
    private String userId;
    private String name;
    private String description;
    private String coverUrl;
    private List<String> songIds;
    private boolean isPrivate = false;
    private int followers = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public Playlist() {
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

    // Builder pattern
    public static PlaylistBuilder builder() {
        return new PlaylistBuilder();
    }

    public static class PlaylistBuilder {
        private String userId;
        private String name;
        private String description;
        private String coverUrl;
        private List<String> songIds;
        private boolean isPrivate = false;
        private int followers = 0;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public PlaylistBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public PlaylistBuilder name(String name) {
            this.name = name;
            return this;
        }

        public PlaylistBuilder description(String description) {
            this.description = description;
            return this;
        }

        public PlaylistBuilder coverUrl(String coverUrl) {
            this.coverUrl = coverUrl;
            return this;
        }

        public PlaylistBuilder songIds(List<String> songIds) {
            this.songIds = songIds;
            return this;
        }

        public PlaylistBuilder isPrivate(boolean isPrivate) {
            this.isPrivate = isPrivate;
            return this;
        }

        public PlaylistBuilder followers(int followers) {
            this.followers = followers;
            return this;
        }

        public PlaylistBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PlaylistBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Playlist build() {
            Playlist playlist = new Playlist();
            playlist.userId = this.userId;
            playlist.name = this.name;
            playlist.description = this.description;
            playlist.coverUrl = this.coverUrl;
            playlist.songIds = this.songIds;
            playlist.isPrivate = this.isPrivate;
            playlist.followers = this.followers;
            playlist.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            playlist.updatedAt = this.updatedAt;
            return playlist;
        }
    }
}

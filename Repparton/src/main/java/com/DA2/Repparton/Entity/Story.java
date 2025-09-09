package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "stories")
public class Story {
    @Id
    private String id;
    private String userId;
    private String type; // IMAGE, AUDIO, TEXT
    private String content; // text content
    private String mediaUrl; // URL for image/audio files
    private String songId; // reference to song if sharing song
    private boolean isPrivate = false;
    private int views = 0;
    private int likes = 0;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    // Default constructor
    public Story() {
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24); // Stories expire after 24 hours
    }

    // Constructor với tham số cơ bản
    public Story(String userId, String type, String content) {
        this.userId = userId;
        this.type = type;
        this.content = content;
        this.isPrivate = false;
        this.views = 0;
        this.likes = 0;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24);
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

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMediaUrl() {
        return mediaUrl;
    }

    public void setMediaUrl(String mediaUrl) {
        this.mediaUrl = mediaUrl;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    // Alias methods để tương thích với StoryService
    public void setContentUrl(String contentUrl) {
        this.mediaUrl = contentUrl;
    }

    public void setTextContent(String textContent) {
        this.content = textContent;
    }
}

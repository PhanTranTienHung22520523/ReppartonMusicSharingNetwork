package com.DA2.Repparton.DTO;

import com.DA2.Repparton.Entity.Story;
import com.DA2.Repparton.Entity.User;
import java.time.LocalDateTime;

public class StoryWithUserDTO {
    private String id;
    private String userId;
    private String type;
    private String textContent;
    private String contentUrl;
    private String songId;
    private boolean isPrivate;
    private int views;
    private int likes;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    
    // User information
    private String userDisplayName;
    private String userFullName;
    private String userAvatarUrl;
    private String userEmail;

    public StoryWithUserDTO() {}

    public StoryWithUserDTO(Story story, User user) {
        this.id = story.getId();
        this.userId = story.getUserId();
        this.type = story.getType();
        this.textContent = story.getContent();
        this.contentUrl = story.getMediaUrl();
        this.songId = story.getSongId();
        this.isPrivate = story.isPrivate();
        this.views = story.getViews();
        this.likes = story.getLikes();
        this.createdAt = story.getCreatedAt();
        this.expiresAt = story.getExpiresAt();
        
        if (user != null) {
            this.userDisplayName = user.getUsername();
            this.userFullName = user.getFullName();
            this.userAvatarUrl = user.getAvatarUrl();
            this.userEmail = user.getEmail();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getTextContent() { return textContent; }
    public void setTextContent(String textContent) { this.textContent = textContent; }

    public String getContentUrl() { return contentUrl; }
    public void setContentUrl(String contentUrl) { this.contentUrl = contentUrl; }

    public String getSongId() { return songId; }
    public void setSongId(String songId) { this.songId = songId; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean isPrivate) { this.isPrivate = isPrivate; }

    public int getViews() { return views; }
    public void setViews(int views) { this.views = views; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public String getUserDisplayName() { return userDisplayName; }
    public void setUserDisplayName(String userDisplayName) { this.userDisplayName = userDisplayName; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserAvatarUrl() { return userAvatarUrl; }
    public void setUserAvatarUrl(String userAvatarUrl) { this.userAvatarUrl = userAvatarUrl; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}

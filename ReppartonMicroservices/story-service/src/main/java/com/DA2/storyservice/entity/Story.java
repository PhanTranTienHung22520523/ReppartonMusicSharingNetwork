package com.DA2.storyservice.entity;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "stories")
public class Story {
    @Id
    private String id;
    private String userId;
    private String type; // IMAGE, AUDIO, TEXT
    private String textContent; // text content (changed from 'content')
    private String contentUrl; // URL for image/audio files (changed from 'mediaUrl')
    private String songId; // reference to song if sharing song
    private boolean isPrivate = false;
    private int views = 0;
    private int likes = 0;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;

    // Constructor với tham số cơ bản
    public Story(String userId, String type, String textContent) {
        this.userId = userId;
        this.type = type;
        this.textContent = textContent;
        this.isPrivate = false;
        this.views = 0;
        this.likes = 0;
        this.createdAt = LocalDateTime.now();
        this.expiresAt = LocalDateTime.now().plusHours(24);
    }

    // Helper method to check if story is expired
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiresAt);
    }

    // Helper method to increment views
    public void incrementViews() {
        this.views++;
    }

    // Helper method to increment likes
    public void incrementLikes() {
        this.likes++;
    }

    // Helper method to decrement likes
    public void decrementLikes() {
        if (this.likes > 0) {
            this.likes--;
        }
    }
}
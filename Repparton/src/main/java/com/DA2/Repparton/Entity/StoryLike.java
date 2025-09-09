package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "story_likes")
public class StoryLike {
    private String storyId;
    private String userId;
    private LocalDateTime likedAt;

    public StoryLike() {}

    public StoryLike(String storyId, String userId, LocalDateTime likedAt) {
        this.storyId = storyId;
        this.userId = userId;
        this.likedAt = likedAt;
    }

    public String getStoryId() {
        return storyId;
    }

    public void setStoryId(String storyId) {
        this.storyId = storyId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public LocalDateTime getLikedAt() {
        return likedAt;
    }

    public void setLikedAt(LocalDateTime likedAt) {
        this.likedAt = likedAt;
    }

    // Getter + Setter
}

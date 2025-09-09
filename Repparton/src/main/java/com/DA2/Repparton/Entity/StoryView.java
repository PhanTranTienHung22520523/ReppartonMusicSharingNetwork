package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "story_views")
public class StoryView {
    private String storyId;
    private String userId;
    private LocalDateTime viewedAt;

    public StoryView() {}

    public StoryView(String storyId, String userId, LocalDateTime viewedAt) {
        this.storyId = storyId;
        this.userId = userId;
        this.viewedAt = viewedAt;
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

    public LocalDateTime getViewedAt() {
        return viewedAt;
    }

    public void setViewedAt(LocalDateTime viewedAt) {
        this.viewedAt = viewedAt;
    }

    // Getter + Setter
}

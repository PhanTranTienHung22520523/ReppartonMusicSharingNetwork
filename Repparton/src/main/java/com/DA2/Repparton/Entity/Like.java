package com.DA2.Repparton.Entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "likes")
public class Like {
    @Id
    private String id;
    private String userId;
    private String songId;
    private String postId;
    private LocalDateTime createdAt;

    // Constructor cho song like
    public Like(String userId, String songId) {
        this.userId = userId;
        this.songId = songId;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor cho post like
    public Like(String userId, String postId, boolean isPostLike) {
        this.userId = userId;
        this.postId = postId;
        this.createdAt = LocalDateTime.now();
    }

    // Getter methods thủ công
    public String getId() {
        return this.id;
    }

    public String getUserId() {
        return this.userId;
    }

    public String getSongId() {
        return this.songId;
    }

    public String getPostId() {
        return this.postId;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    // Setter methods thủ công
    public void setId(String id) {
        this.id = id;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

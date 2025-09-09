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
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String userId;
    private String songId;
    private String postId;
    private String playlistId; // Add support for playlist comments
    private String parentId;
    private String content;
    private LocalDateTime createdAt;

    // Constructor cho song comment
    public Comment(String userId, String songId, String content) {
        this.userId = userId;
        this.songId = songId;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor cho post comment
    public Comment(String userId, String postId, String content, boolean isPostComment) {
        this.userId = userId;
        this.postId = postId;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor cho playlist comment
    public Comment(String userId, String playlistId, String content, String type) {
        this.userId = userId;
        this.playlistId = playlistId;
        this.content = content;
        this.createdAt = LocalDateTime.now();
    }

    // Constructor với parentId (reply)
    public Comment(String userId, String songId, String postId, String parentId, String content) {
        this.userId = userId;
        this.songId = songId;
        this.postId = postId;
        this.parentId = parentId;
        this.content = content;
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

    public String getPlaylistId() {
        return this.playlistId;
    }

    public String getParentId() {
        return this.parentId;
    }

    public String getContent() {
        return this.content;
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

    public void setPlaylistId(String playlistId) {
        this.playlistId = playlistId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

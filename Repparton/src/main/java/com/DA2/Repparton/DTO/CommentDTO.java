package com.DA2.Repparton.DTO;

import java.time.LocalDateTime;

public class CommentDTO {
    private String id;
    private String userId;
    private String userName;
    private String userAvatar;
    private String songId;
    private String postId;
    private String playlistId; // Add playlistId field
    private String parentId;
    private String content;
    private LocalDateTime createdAt;

    public CommentDTO() {}

    // Constructor cho song comments
    public CommentDTO(String id, String userId, String userName, String userAvatar,
                      String songId, String parentId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.songId = songId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Constructor cho cả song và post comments
    public CommentDTO(String id, String userId, String userName, String userAvatar,
                      String songId, String postId, String parentId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.songId = songId;
        this.postId = postId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
    }

    // Constructor cho playlist comments
    public CommentDTO(String id, String userId, String userName, String userAvatar,
                      String songId, String postId, String playlistId, String parentId, String content, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userAvatar = userAvatar;
        this.songId = songId;
        this.postId = postId;
        this.playlistId = playlistId;
        this.parentId = parentId;
        this.content = content;
        this.createdAt = createdAt;
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

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public String getPostId() {
        return postId;
    }

    public void setPostId(String postId) {
        this.postId = postId;
    }

    public String getPlaylistId() {
        return playlistId;
    }

    public void setPlaylistId(String playlistId) {
        this.playlistId = playlistId;
    }

    public String getParentId() {
        return parentId;
    }

    public void setParentId(String parentId) {
        this.parentId = parentId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;
    private String content;
    private String mediaUrl;
    private String mediaType;
    private boolean isPrivate = false;
    private int likes = 0;
    private int shares = 0;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Default constructor
    public Post() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructor với tham số
    public Post(String userId, String content) {
        this.userId = userId;
        this.content = content;
        this.createdAt = LocalDateTime.now();
        this.isPrivate = false;
        this.likes = 0;
        this.shares = 0;
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

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean isPrivate) {
        this.isPrivate = isPrivate;
    }

    public int getLikes() {
        return likes;
    }

    public void setLikes(int likes) {
        this.likes = likes;
    }

    public int getShares() {
        return shares;
    }

    public void setShares(int shares) {
        this.shares = shares;
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
    public static PostBuilder builder() {
        return new PostBuilder();
    }

    public static class PostBuilder {
        private String userId;
        private String content;
        private String mediaUrl;
        private String mediaType;
        private boolean isPrivate = false;
        private int likes = 0;
        private int shares = 0;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public PostBuilder userId(String userId) {
            this.userId = userId;
            return this;
        }

        public PostBuilder content(String content) {
            this.content = content;
            return this;
        }

        public PostBuilder mediaUrl(String mediaUrl) {
            this.mediaUrl = mediaUrl;
            return this;
        }

        public PostBuilder mediaType(String mediaType) {
            this.mediaType = mediaType;
            return this;
        }

        public PostBuilder isPrivate(boolean isPrivate) {
            this.isPrivate = isPrivate;
            return this;
        }

        public PostBuilder likes(int likes) {
            this.likes = likes;
            return this;
        }

        public PostBuilder shares(int shares) {
            this.shares = shares;
            return this;
        }

        public PostBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public PostBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Post build() {
            Post post = new Post();
            post.userId = this.userId;
            post.content = this.content;
            post.mediaUrl = this.mediaUrl;
            post.mediaType = this.mediaType;
            post.isPrivate = this.isPrivate;
            post.likes = this.likes;
            post.shares = this.shares;
            post.createdAt = this.createdAt != null ? this.createdAt : LocalDateTime.now();
            post.updatedAt = this.updatedAt;
            return post;
        }
    }
}

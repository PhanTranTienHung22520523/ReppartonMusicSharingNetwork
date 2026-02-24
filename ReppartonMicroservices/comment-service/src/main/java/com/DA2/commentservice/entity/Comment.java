package com.DA2.commentservice.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String userId;
    private String userName;
    private String userAvatar;
    private String songId;
    private String postId;
    private String playlistId;
    private String parentId; // For replies
    private String content;
    private int likes = 0;

    /**
     * Internal unique likers (per-user toggle support). Not exposed to clients.
     */
    @JsonIgnore
    private Set<String> likedBy = new HashSet<>();

    /**
     * Derived for the current viewer; computed server-side when a token is present.
     */
    @Transient
    private Boolean liked = false;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Comment() {
        this.createdAt = LocalDateTime.now();
        this.likes = 0;
    }

    public Comment(String userId, String content) {
        this();
        this.userId = userId;
        this.content = content;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatar() { return userAvatar; }
    public void setUserAvatar(String userAvatar) { this.userAvatar = userAvatar; }
    
    public String getSongId() { return songId; }
    public void setSongId(String songId) { this.songId = songId; }
    
    public String getPostId() { return postId; }
    public void setPostId(String postId) { this.postId = postId; }
    
    public String getPlaylistId() { return playlistId; }
    public void setPlaylistId(String playlistId) { this.playlistId = playlistId; }
    
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    
    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public Set<String> getLikedBy() { return likedBy; }
    public void setLikedBy(Set<String> likedBy) { this.likedBy = likedBy; }

    public Boolean getLiked() { return liked; }
    public void setLiked(Boolean liked) { this.liked = liked; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public void incrementLikes() { this.likes++; }
    public void decrementLikes() { if (this.likes > 0) this.likes--; }
}

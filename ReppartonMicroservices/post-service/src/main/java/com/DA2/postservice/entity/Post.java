package com.DA2.postservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.Transient;
import java.time.LocalDateTime;

@Document(collection = "posts")
public class Post {
    @Id
    private String id;
    private String userId;
    // Denormalized user fields (present in existing Mongo documents)
    private String username;
    private String userProfilePic;
    // Attached song id (if post references a song)
    private String songId;
    private String content;
    private String mediaUrl;
    private String mediaType; // "image", "video", "audio", "other"
    private boolean isPrivate = false;
    private int likes = 0;
    private int shares = 0;
    private int comments = 0;
    
    private String sharedPostId;
    private String type; // "POST", "SHARE"

    // Location check-in fields
    private String locationName; // e.g., "Ho Chi Minh City, Vietnam"
    private Double latitude;
    private Double longitude;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Transient
    private Object attachedSong;

    @Transient
    private Object sharedPost;

    public Post() {
        this.createdAt = LocalDateTime.now();
        this.isPrivate = false;
        this.likes = 0;
        this.shares = 0;
        this.comments = 0;
    }

    public Post(String userId, String content) {
        this();
        this.userId = userId;
        this.content = content;
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

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getUserProfilePic() {
        return userProfilePic;
    }

    public void setUserProfilePic(String userProfilePic) {
        this.userProfilePic = userProfilePic;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
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

    public int getComments() {
        return comments;
    }

    public void setComments(int comments) {
        this.comments = comments;
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

    public Object getAttachedSong() {
        return attachedSong;
    }

    public void setAttachedSong(Object attachedSong) {
        this.attachedSong = attachedSong;
    }

    public void incrementLikes() {
        this.likes++;
    }

    public void decrementLikes() {
        if (this.likes > 0) {
            this.likes--;
        }
    }

    public void incrementShares() {
        this.shares++;
    }

    public void incrementComments() {
        this.comments++;
    }

    public void decrementComments() {
        if (this.comments > 0) {
            this.comments--;
        }
    }

    // Location getters and setters
    public String getLocationName() {
        return locationName;
    }

    public void setLocationName(String locationName) {
        this.locationName = locationName;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getSharedPostId() {
        return sharedPostId;
    }

    public void setSharedPostId(String sharedPostId) {
        this.sharedPostId = sharedPostId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Object getSharedPost() {
        return sharedPost;
    }

    public void setSharedPost(Object sharedPost) {
        this.sharedPost = sharedPost;
    }
}

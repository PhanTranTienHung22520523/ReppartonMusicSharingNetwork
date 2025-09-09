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
@Document(collection = "follows")
public class Follow {
    @Id
    private String id;
    private String followerId;
    private String artistId;
    private LocalDateTime createdAt;

    // Constructor đầy đủ thủ công
    public Follow(String followerId, String artistId) {
        this.followerId = followerId;
        this.artistId = artistId;
        this.createdAt = LocalDateTime.now();
    }

    // Getter methods thủ công
    public String getId() {
        return this.id;
    }

    public String getFollowerId() {
        return this.followerId;
    }

    public String getArtistId() {
        return this.artistId;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    // Setter methods thủ công
    public void setId(String id) {
        this.id = id;
    }

    public void setFollowerId(String followerId) {
        this.followerId = followerId;
    }

    public void setArtistId(String artistId) {
        this.artistId = artistId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

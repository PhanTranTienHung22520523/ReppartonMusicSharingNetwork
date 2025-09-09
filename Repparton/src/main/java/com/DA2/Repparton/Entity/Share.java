package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "shares")
public class Share {
    @Id
    private String id;
    private String userId;
    private String songId;
    private String platform;
    private LocalDateTime sharedAt;

    public Share() {}

    public Share(String id, String userId, String songId, String platform, LocalDateTime sharedAt) {
        this.id = id;
        this.userId = userId;
        this.songId = songId;
        this.platform = platform;
        this.sharedAt = sharedAt;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSongId() {
        return songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public String getPlatform() {
        return platform;
    }

    public void setPlatform(String platform) {
        this.platform = platform;
    }

    public LocalDateTime getSharedAt() {
        return sharedAt;
    }

    public void setSharedAt(LocalDateTime sharedAt) {
        this.sharedAt = sharedAt;
    }

    // Getter + Setter
}

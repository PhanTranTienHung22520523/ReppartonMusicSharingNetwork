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
@Document(collection = "listen_history")
public class ListenHistory {
    @Id
    private String id;
    private String userId;
    private String songId;
    private LocalDateTime createdAt;

    // Constructor với tham số cơ bản
    public ListenHistory(String userId, String songId) {
        this.userId = userId;
        this.songId = songId;
        this.createdAt = LocalDateTime.now();
    }

    // Getter/setter methods thủ công để đảm bảo tồn tại
    public String getId() {
        return this.id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return this.userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSongId() {
        return this.songId;
    }

    public void setSongId(String songId) {
        this.songId = songId;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

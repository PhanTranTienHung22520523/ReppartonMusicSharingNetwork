package com.DA2.Repparton.DTO;

import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Entity.User;
import java.time.LocalDateTime;
import java.util.List;

public class PlaylistDTO {
    private String id;
    private String name;
    private String description;
    private boolean isPublic;
    private String userId;
    private User user;
    private List<Song> songs;
    private int songCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Constructors
    public PlaylistDTO() {}

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public List<Song> getSongs() { return songs; }
    public void setSongs(List<Song> songs) { 
        this.songs = songs; 
        this.songCount = songs != null ? songs.size() : 0;
    }

    public int getSongCount() { return songCount; }
    public void setSongCount(int songCount) { this.songCount = songCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

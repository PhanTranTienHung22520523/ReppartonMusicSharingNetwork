package com.DA2.Repparton.DTO;

import org.springframework.web.multipart.MultipartFile;

public class UpdateProfileRequestDTO {
    private String username;
    private String bio;
    private MultipartFile avatarUrl; // có thể null nếu không thay đổi
    private MultipartFile coverUrl;

    public UpdateProfileRequestDTO() {}

    // Getters & Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public MultipartFile getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(MultipartFile avatarUrl) { this.avatarUrl = avatarUrl; }

    public MultipartFile getCoverUrl() { return coverUrl; }
    public void setCoverUrl(MultipartFile coverUrl) { this.coverUrl = coverUrl; }
}

package com.DA2.Repparton.DTO;

import org.springframework.web.multipart.MultipartFile;

public class RegisterRequestDTO {
    private String username;
    private String email;
    private String password;
    private String confirmPassword;
    private String fullName;
    private String role;
    private String bio;
    private MultipartFile avatarUrl; // optional
    private MultipartFile coverUrl;  // optional

    public RegisterRequestDTO() {}

    public RegisterRequestDTO(String username, String email, String password, String confirmPassword,
                           String fullName, String role, String bio, MultipartFile avatarUrl, MultipartFile coverUrl) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.fullName = fullName;
        this.role = role;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.coverUrl = coverUrl;
    }

    // GETTERS & SETTERS
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getConfirmPassword() { return confirmPassword; }
    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public MultipartFile getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(MultipartFile avatarUrl) { this.avatarUrl = avatarUrl; }

    public MultipartFile getCoverUrl() { return coverUrl; }
    public void setCoverUrl(MultipartFile coverUrl) { this.coverUrl = coverUrl; }
}

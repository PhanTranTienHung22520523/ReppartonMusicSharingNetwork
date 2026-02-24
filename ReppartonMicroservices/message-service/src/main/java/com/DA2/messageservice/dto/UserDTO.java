package com.DA2.messageservice.dto;

public class UserDTO {
    private String id;
    private String username;
    private String fullName;
    private String avatar;
    private String role; // USER, ARTIST
    private boolean allowNormalUserMessages; // For artists: allow normal users to send DMs

    public UserDTO() {}

    public UserDTO(String id, String username, String fullName, String avatar) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.avatar = avatar;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public boolean isAllowNormalUserMessages() {
        return allowNormalUserMessages;
    }
    
    public void setAllowNormalUserMessages(boolean allowNormalUserMessages) {
        this.allowNormalUserMessages = allowNormalUserMessages;
    }
}
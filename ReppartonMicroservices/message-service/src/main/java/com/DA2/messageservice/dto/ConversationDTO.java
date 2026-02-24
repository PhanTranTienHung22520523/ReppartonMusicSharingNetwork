package com.DA2.messageservice.dto;

import java.time.LocalDateTime;

public class ConversationDTO {
    private String id;
    private UserDTO user1;
    private UserDTO user2;

    private String lastMessage;
    private LocalDateTime lastMessageAt;
    private boolean isUnread;
    private long unreadCount;

    public ConversationDTO() {}

    public ConversationDTO(String id, UserDTO user1, UserDTO user2) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
    }

    public ConversationDTO(String id, UserDTO user1, UserDTO user2, String lastMessage, LocalDateTime lastMessageAt, long unreadCount) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
        this.lastMessage = lastMessage;
        this.lastMessageAt = lastMessageAt;
        this.unreadCount = unreadCount;
        this.isUnread = unreadCount > 0;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public UserDTO getUser1() {
        return user1;
    }

    public void setUser1(UserDTO user1) {
        this.user1 = user1;
    }

    public UserDTO getUser2() {
        return user2;
    }

    public void setUser2(UserDTO user2) {
        this.user2 = user2;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }

    public boolean isUnread() {
        return isUnread;
    }

    public void setUnread(boolean unread) {
        isUnread = unread;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
        this.isUnread = unreadCount > 0;
    }
}
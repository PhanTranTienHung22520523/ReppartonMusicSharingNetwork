package com.DA2.messageservice.dto;

public class ConversationDTO {
    private String id;
    private UserDTO user1;
    private UserDTO user2;

    public ConversationDTO() {}

    public ConversationDTO(String id, UserDTO user1, UserDTO user2) {
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
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
}
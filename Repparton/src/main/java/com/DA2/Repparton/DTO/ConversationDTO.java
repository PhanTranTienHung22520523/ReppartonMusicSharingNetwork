package com.DA2.Repparton.DTO;

import com.DA2.Repparton.Entity.User;

public class ConversationDTO {
    String id;
    User user1;
    User user2;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser1() {
        return user1;
    }

    public void setUser1(User user1) {
        this.user1 = user1;
    }

    public User getUser2() {
        return user2;
    }

    public void setUser2(User user2) {
        this.user2 = user2;
    }

    public ConversationDTO(){

    }

    public ConversationDTO(String id, User user1, User user2){
        this.id = id;
        this.user1 = user1;
        this.user2 = user2;
    }
}

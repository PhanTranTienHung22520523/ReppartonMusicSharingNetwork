package com.DA2.shared.events;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class UserRegisteredEvent extends BaseEvent {
    private String username;
    private String email;
    private String profileId;
    
    public UserRegisteredEvent(String eventId, String userId, String username, String email, String profileId) {
        super(eventId, "USER_REGISTERED", java.time.LocalDateTime.now(), "user-service", userId);
        this.username = username;
        this.email = email;
        this.profileId = profileId;
    }
}

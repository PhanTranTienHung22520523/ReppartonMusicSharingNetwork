package com.DA2.shared.events;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NotificationEvent extends BaseEvent {
    private String recipientId;
    private String title;
    private String message;
    private String notificationType;
    private String relatedEntityId;
    
    public NotificationEvent(String eventId, String userId, String recipientId, String title, String message, String notificationType, String relatedEntityId) {
        super(eventId, "NOTIFICATION_CREATED", java.time.LocalDateTime.now(), "notification-service", userId);
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.relatedEntityId = relatedEntityId;
    }
}

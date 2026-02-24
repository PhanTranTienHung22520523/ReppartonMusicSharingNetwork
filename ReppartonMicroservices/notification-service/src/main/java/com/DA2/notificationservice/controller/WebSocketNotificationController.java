package com.DA2.notificationservice.controller;

import com.DA2.notificationservice.entity.Notification;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
public class WebSocketNotificationController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    /**
     * Send notification to specific user
     */
    public void sendNotificationToUser(String userId, Notification notification) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }

    /**
     * Broadcast notification to all users
     */
    public void broadcastNotification(Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    /**
     * Handle incoming subscribe message from clients
     */
    @MessageMapping("/notifications/subscribe")
    @SendTo("/topic/notifications")
    public String handleSubscribe(String userId) {
        return "Subscribed to notifications for user: " + userId;
    }
}

package com.DA2.eventservice.listener;

import com.DA2.shared.events.UserRegisteredEvent;
import com.DA2.shared.events.SongPlayedEvent;
import com.DA2.shared.events.NotificationEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class EventListener {

    @RabbitListener(queues = "user.registered.queue")
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        log.info("Processing user registered event: {} for user: {}", event.getEventId(), event.getUsername());
        
        // Process user registration
        // - Send welcome email
        // - Create default playlists
        // - Initialize user preferences
        
        try {
            // Simulate processing
            Thread.sleep(1000);
            log.info("Successfully processed user registered event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to process user registered event: {}", event.getEventId(), e);
        }
    }

    @RabbitListener(queues = "song.played.queue")
    public void handleSongPlayedEvent(SongPlayedEvent event) {
        log.info("Processing song played event: {} for song: {}", event.getEventId(), event.getSongTitle());
        
        // Process song play
        // - Update play count
        // - Update user listening history
        // - Update recommendations
        
        try {
            // Simulate processing
            Thread.sleep(500);
            log.info("Successfully processed song played event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to process song played event: {}", event.getEventId(), e);
        }
    }

    @RabbitListener(queues = "notification.queue")
    public void handleNotificationEvent(NotificationEvent event) {
        log.info("Processing notification event: {} for recipient: {}", event.getEventId(), event.getRecipientId());
        
        // Process notification
        // - Send push notification
        // - Send email notification
        // - Store in database
        
        try {
            // Simulate processing
            Thread.sleep(300);
            log.info("Successfully processed notification event: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to process notification event: {}", event.getEventId(), e);
        }
    }

    @KafkaListener(topics = "user-events", groupId = "analytics-group")
    public void handleUserAnalytics(UserRegisteredEvent event) {
        log.info("Processing user analytics for event: {}", event.getEventId());
        
        // Process for analytics
        // - Update user metrics
        // - Track registration sources
        // - Generate reports
        
        try {
            // Simulate analytics processing
            Thread.sleep(200);
            log.info("Successfully processed user analytics: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to process user analytics: {}", event.getEventId(), e);
        }
    }

    @KafkaListener(topics = "song-events", groupId = "analytics-group")
    public void handleSongAnalytics(SongPlayedEvent event) {
        log.info("Processing song analytics for event: {}", event.getEventId());
        
        // Process for analytics
        // - Update song popularity metrics
        // - Track listening patterns
        // - Generate trending data
        
        try {
            // Simulate analytics processing
            Thread.sleep(200);
            log.info("Successfully processed song analytics: {}", event.getEventId());
        } catch (Exception e) {
            log.error("Failed to process song analytics: {}", event.getEventId(), e);
        }
    }

    @KafkaListener(topics = "analytics-events", groupId = "reporting-group")
    public void handleReportingEvents(Object event) {
        log.info("Processing reporting event: {}", event.toString());
        
        // Process for reporting
        // - Generate real-time reports
        // - Update dashboards
        // - Send metrics to monitoring systems
        
        try {
            // Simulate reporting processing
            Thread.sleep(100);
            log.info("Successfully processed reporting event");
        } catch (Exception e) {
            log.error("Failed to process reporting event", e);
        }
    }
}

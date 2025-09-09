package com.DA2.eventservice.controller;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.shared.events.*;
import com.DA2.eventservice.service.EventPublisherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EventController {

    private final EventPublisherService eventPublisherService;
    private final RedisTemplate<String, Object> redisTemplate;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "event-service"));
    }

    @PostMapping("/user/registered")
    public ResponseEntity<ApiResponse<String>> publishUserRegistered(@RequestBody UserRegisteredEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            eventPublisherService.publishUserRegisteredEvent(event);
            return ResponseEntity.ok(ApiResponse.success("User registered event published", event.getEventId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to publish event: " + e.getMessage()));
        }
    }

    @PostMapping("/song/played")
    public ResponseEntity<ApiResponse<String>> publishSongPlayed(@RequestBody SongPlayedEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            eventPublisherService.publishSongPlayedEvent(event);
            
            // Cache recent play count in Redis
            String cacheKey = "song:plays:" + event.getSongId();
            redisTemplate.opsForValue().increment(cacheKey);
            
            return ResponseEntity.ok(ApiResponse.success("Song played event published", event.getEventId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to publish event: " + e.getMessage()));
        }
    }

    @PostMapping("/notification")
    public ResponseEntity<ApiResponse<String>> publishNotification(@RequestBody NotificationEvent event) {
        try {
            event.setEventId(UUID.randomUUID().toString());
            eventPublisherService.publishNotificationEvent(event);
            return ResponseEntity.ok(ApiResponse.success("Notification event published", event.getEventId()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to publish event: " + e.getMessage()));
        }
    }

    @GetMapping("/cache/song-plays/{songId}")
    public ResponseEntity<ApiResponse<Long>> getSongPlayCount(@PathVariable String songId) {
        try {
            String cacheKey = "song:plays:" + songId;
            Object count = redisTemplate.opsForValue().get(cacheKey);
            Long playCount = count != null ? Long.valueOf(count.toString()) : 0L;
            return ResponseEntity.ok(ApiResponse.success("Song play count retrieved", playCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to get play count: " + e.getMessage()));
        }
    }

    @GetMapping("/cache/clear")
    public ResponseEntity<ApiResponse<String>> clearCache() {
        try {
            redisTemplate.getConnectionFactory().getConnection().flushAll();
            return ResponseEntity.ok(ApiResponse.success("Cache cleared successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Failed to clear cache: " + e.getMessage()));
        }
    }
}

package com.DA2.analyticsservice.service;

import com.DA2.analyticsservice.repository.ListenHistoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class GenreLearningService {

    private static final Logger log = LoggerFactory.getLogger(GenreLearningService.class);
    private static final int LISTEN_THRESHOLD = 5; // Trigger analysis after 5 listens
    private static final int HISTORY_LIMIT = 50; // Analyze last 50 songs
    private static final int TOP_GENRES_COUNT = 5; // Keep top 5 genres

    // In-memory counter: userId -> listen count since last update
    private final Map<String, Integer> userListenCounts = new ConcurrentHashMap<>();

    @Autowired
    private ListenHistoryRepository listenHistoryRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    /**
     * Increment listen count for user. Triggers genre analysis after threshold.
     */
    public void recordListen(String userId) {
        if (userId == null || userId.isBlank()) return;

        int count = userListenCounts.getOrDefault(userId, 0) + 1;
        userListenCounts.put(userId, count);

        log.debug("User {} listen count: {}", userId, count);

        if (count >= LISTEN_THRESHOLD) {
            // Reset counter and trigger analysis
            userListenCounts.put(userId, 0);
            analyzeAndUpdateGenres(userId);
        }
    }

    /**
     * Analyze user's listening history and update preferred genres (async).
     */
    @Async
    public void analyzeAndUpdateGenres(String userId) {
        try {
            log.info("Analyzing genres for user: {}", userId);

            // 1. Get recent listen history
            List<String> songIds = getRecentSongIds(userId, HISTORY_LIMIT);
            if (songIds.isEmpty()) {
                log.warn("No listen history found for user: {}", userId);
                return;
            }

            // 2. Fetch song details and extract genres
            Map<String, Integer> genreFrequency = new HashMap<>();
            for (String songId : songIds) {
                try {
                    Object songResp = restTemplate.getForObject(
                        apiGatewayUrl + "/api/songs/" + songId, Object.class);
                    
                    if (songResp instanceof Map<?, ?> respMap) {
                        Object songData = respMap.get("data");
                        Map<String, Object> song = songData != null 
                            ? (Map<String, Object>) songData 
                            : (Map<String, Object>) songResp;
                        
                        // Extract genre
                        Object genreObj = song.get("genre");
                        if (genreObj != null) {
                            String genre = String.valueOf(genreObj).trim();
                            if (!genre.isEmpty() && !genre.equalsIgnoreCase("null")) {
                                genreFrequency.put(genre, genreFrequency.getOrDefault(genre, 0) + 1);
                            }
                        }
                    }
                } catch (Exception e) {
                    log.debug("Failed to fetch song {}: {}", songId, e.getMessage());
                }
            }

            if (genreFrequency.isEmpty()) {
                log.warn("No genres found in listen history for user: {}", userId);
                return;
            }

            // 3. Get top genres
            List<String> topGenres = genreFrequency.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(TOP_GENRES_COUNT)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());

            log.info("Top genres for user {}: {}", userId, topGenres);

            // 4. Update user's preferred genres
            updateUserPreferredGenres(userId, topGenres);

            // 5. Trigger AI recommendation refresh
            triggerRecommendationRefresh(userId);

        } catch (Exception e) {
            log.error("Failed to analyze genres for user {}: {}", userId, e.getMessage(), e);
        }
    }

    /**
     * Trigger recommendation refresh in recommendation-service.
     */
    private void triggerRecommendationRefresh(String userId) {
        try {
            restTemplate.postForObject(
                apiGatewayUrl + "/api/recommendations/refresh/" + userId,
                null, 
                Object.class
            );
            log.info("Triggered recommendation refresh for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to trigger recommendation refresh for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Get recent song IDs from listen history.
     */
    private List<String> getRecentSongIds(String userId, int limit) {
        try {
            LocalDateTime since = LocalDateTime.now().minusDays(30); // Last 30 days
            return listenHistoryRepository.findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(
                userId, since
            ).stream()
                .limit(limit)
                .map(history -> history.getSongId())
                .distinct()
                .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Failed to fetch listen history for user {}: {}", userId, e.getMessage());
            return Collections.emptyList();
        }
    }

    /**
     * Update user's preferred genres via user-service.
     */
    private void updateUserPreferredGenres(String userId, List<String> genres) {
        try {
            Map<String, Object> updateRequest = new HashMap<>();
            updateRequest.put("preferredGenres", genres);

            restTemplate.put(
                apiGatewayUrl + "/api/users/" + userId + "/preferred-genres",
                updateRequest
            );

            log.info("Updated preferred genres for user {}: {}", userId, genres);
        } catch (Exception e) {
            log.error("Failed to update preferred genres for user {}: {}", userId, e.getMessage());
        }
    }

    /**
     * Reset listen count for a user (for testing/manual reset).
     */
    public void resetListenCount(String userId) {
        userListenCounts.remove(userId);
    }
}

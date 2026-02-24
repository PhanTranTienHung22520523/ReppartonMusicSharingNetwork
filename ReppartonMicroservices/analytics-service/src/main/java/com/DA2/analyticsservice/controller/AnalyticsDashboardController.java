package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.repository.ListenHistoryRepository;
import com.DA2.analyticsservice.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class AnalyticsDashboardController {

    private final ListenHistoryRepository listenHistoryRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final RestTemplate restTemplate;
    
    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    public AnalyticsDashboardController(
            ListenHistoryRepository listenHistoryRepository,
            SearchHistoryRepository searchHistoryRepository,
            RestTemplate restTemplate
    ) {
        this.listenHistoryRepository = listenHistoryRepository;
        this.searchHistoryRepository = searchHistoryRepository;
        this.restTemplate = restTemplate;
    }

    public record UserAnalyticsResponse(long totalPlays, long totalListeners) {}

    public record TopSongItem(String id, String title, String artist, long plays, int growth) {}

    public record HistoryItem(String date, long plays) {}

    public record SearchItem(String query, String timestamp, long count) {}

    @GetMapping("/user")
    public ResponseEntity<?> getUserAnalytics(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(name = "timeRange", defaultValue = "week") String timeRange
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing X-User-Id"));
        }

        var range = resolveRange(timeRange);
        long totalPlays = listenHistoryRepository.countUserPlaysBetween(userId, range.from, range.to);
        // UI label is "Total Listeners"; for a listener dashboard, we treat it as unique artists listened.
        long totalListeners = listenHistoryRepository.countDistinctArtistsBetween(userId, range.from, range.to);
        return ResponseEntity.ok(new UserAnalyticsResponse(totalPlays, totalListeners));
    }

    @GetMapping("/top-songs")
    public ResponseEntity<?> getTopSongs(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(name = "timeRange", defaultValue = "week") String timeRange,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing X-User-Id"));
        }
        int safeLimit = Math.min(Math.max(limit, 1), 200);

        var range = resolveRange(timeRange);
        List<TopSongItem> items = listenHistoryRepository.findTopSongsBetween(userId, range.from, range.to, safeLimit).stream()
                .map(r -> new TopSongItem(
                        r.getSongId(),
                        r.getSongId(),
                        r.getArtistId(),
                        r.getPlays(),
                        0
                ))
                .toList();

        return ResponseEntity.ok(items);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getListeningHistory(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(name = "timeRange", defaultValue = "week") String timeRange
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing X-User-Id"));
        }

        var range = resolveRange(timeRange);
        List<HistoryItem> items = listenHistoryRepository.countDailyPlaysBetween(userId, range.from, range.to).stream()
                .map(r -> new HistoryItem(String.valueOf(r.getDate()), r.getPlays()))
                .toList();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/searches")
    public ResponseEntity<?> getSearchAnalytics(
            @RequestHeader(value = "X-User-Id", required = false) String userId,
            @RequestParam(name = "timeRange", defaultValue = "week") String timeRange,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Missing X-User-Id"));
        }
        int safeLimit = Math.min(Math.max(limit, 1), 200);

        var range = resolveRange(timeRange);
        List<SearchItem> items = searchHistoryRepository.findTopQueriesBetween(userId, range.from, range.to, safeLimit).stream()
                .map(r -> new SearchItem(
                        r.getQuery(),
                        r.getLastTimestamp() == null ? null : r.getLastTimestamp().toString(),
                        r.getCount()
                ))
                .toList();
        return ResponseEntity.ok(items);
    }

    private record Range(LocalDateTime from, LocalDateTime to) {}

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingSongs(
            @RequestParam(name = "timeRange", defaultValue = "week") String timeRange,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        try {
            // Get top songs sorted by playsCount (most viewed)
            Object songsResp = restTemplate.getForObject(
                apiGatewayUrl + "/api/songs?page=0&size=" + limit + "&sort=playsCount,desc", 
                Object.class
            );
            
            if (songsResp instanceof Map<?, ?> m) {
                Object content = m.get("content");
                if (content != null) {
                    return ResponseEntity.ok(content);
                }
            }
            
            return ResponseEntity.ok(songsResp != null ? songsResp : Collections.emptyList());
        } catch (Exception e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
    
    // Helper method to fetch full song details from song-service
    private List<Object> enrichSongsWithDetails(List<String> songIds) {
        if (songIds == null || songIds.isEmpty()) return Collections.emptyList();
        
        List<Object> songs = new ArrayList<>();
        for (String songId : songIds) {
            try {
                Object resp = restTemplate.getForObject(apiGatewayUrl + "/api/songs/" + songId, Object.class);
                if (resp instanceof Map<?, ?> m) {
                    Object songData = m.get("data");
                    if (songData != null) {
                        songs.add(songData);
                    } else {
                        songs.add(resp);
                    }
                } else if (resp != null) {
                    songs.add(resp);
                }
            } catch (Exception e) {
                // Skip songs that fail to load
            }
        }
        return songs;
    }

    private Range resolveRange(String timeRange) {
        String key = timeRange == null ? "week" : timeRange.trim().toLowerCase(Locale.ROOT);
        LocalDateTime to = LocalDateTime.now();
        LocalDateTime from;
        switch (key) {
            case "day" -> from = to.minusDays(1);
            case "month" -> from = to.minusMonths(1);
            case "year" -> from = to.minusYears(1);
            case "week" -> from = to.minusWeeks(1);
            default -> from = to.minusWeeks(1);
        }
        return new Range(from, to);
    }
}

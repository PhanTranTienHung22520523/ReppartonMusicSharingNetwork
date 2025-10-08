package com.DA2.recommendationservice.controller;

import com.DA2.recommendationservice.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Recommendation Service is running");
    }

    // Get personalized recommendations
    @GetMapping("/personalized/{userId}")
    public ResponseEntity<?> getPersonalizedRecommendations(
            @PathVariable String userId,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Map<String, Object> recommendations = recommendationService.getPersonalizedRecommendations(userId, limit);
            return ResponseEntity.ok(recommendations);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Get trending recommendations
    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingRecommendations(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Map<String, Object> trending = recommendationService.getTrendingRecommendations(limit);
            return ResponseEntity.ok(trending);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Get similar songs
    @GetMapping("/similar/{songId}")
    public ResponseEntity<?> getSimilarSongs(
            @PathVariable String songId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> similar = recommendationService.getSimilarSongs(songId, limit);
            return ResponseEntity.ok(similar);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Get default recommendations (for new users)
    @GetMapping("/default")
    public ResponseEntity<?> getDefaultRecommendations(
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Map<String, Object> defaults = recommendationService.getDefaultRecommendations(limit);
            return ResponseEntity.ok(defaults);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Get genre-based recommendations
    @GetMapping("/genre/{genreId}")
    public ResponseEntity<?> getGenreBasedRecommendations(
            @PathVariable String genreId,
            @RequestParam(defaultValue = "20") int limit) {
        try {
            Map<String, Object> genreRecs = recommendationService.getGenreBasedRecommendations(genreId, limit);
            return ResponseEntity.ok(genreRecs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Discover new music
    @GetMapping("/discover/{userId}")
    public ResponseEntity<?> discoverNewMusic(
            @PathVariable String userId,
            @RequestParam(defaultValue = "30") int limit) {
        try {
            Map<String, Object> discover = recommendationService.discoverNewMusic(userId, limit);
            return ResponseEntity.ok(discover);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // "Because you listened to X" recommendations
    @GetMapping("/because-you-listened/{userId}/{songId}")
    public ResponseEntity<?> getBecauseYouListened(
            @PathVariable String userId,
            @PathVariable String songId,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            Map<String, Object> because = recommendationService.getBecauseYouListened(userId, songId, limit);
            return ResponseEntity.ok(because);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }

    // Daily mix
    @GetMapping("/daily-mix/{userId}")
    public ResponseEntity<?> getDailyMix(@PathVariable String userId) {
        try {
            Map<String, Object> dailyMix = recommendationService.getDailyMix(userId);
            return ResponseEntity.ok(dailyMix);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", e.getMessage()
            ));
        }
    }
}

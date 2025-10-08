package com.DA2.recommendationservice.service;

import com.DA2.recommendationservice.client.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.CompletableFuture;

@Service
public class RecommendationService {

    @Autowired
    private AnalyticsServiceClient analyticsServiceClient;

    @Autowired
    private SongServiceClient songServiceClient;

    @Autowired
    private SocialServiceClient socialServiceClient;

    // Get personalized song recommendations for user
    public Map<String, Object> getPersonalizedRecommendations(String userId, int limit) {
        Map<String, Object> recommendations = new HashMap<>();

        try {
            // 1. Get user's listen history
            Object listenHistory = analyticsServiceClient.getUserListenHistory(userId, 50);
            recommendations.put("basedOnHistory", listenHistory);

            // 2. Get songs from followed users (collaborative filtering)
            CompletableFuture<Object> followingFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return socialServiceClient.getFollowing(userId);
                } catch (Exception e) {
                    return Map.of("error", "Social service unavailable");
                }
            });

            // Wait and collect
            recommendations.put("fromFollowing", followingFuture.get());

        } catch (Exception e) {
            recommendations.put("error", "Failed to generate recommendations: " + e.getMessage());
        }

        return recommendations;
    }

    // Get trending songs (most popular recently)
    public Map<String, Object> getTrendingRecommendations(int limit) {
        Map<String, Object> trending = new HashMap<>();
        
        try {
            // This would typically aggregate data from analytics service
            // For now, return placeholder
            trending.put("message", "Trending songs based on recent plays");
            trending.put("limit", limit);
            
        } catch (Exception e) {
            trending.put("error", "Failed to get trending: " + e.getMessage());
        }

        return trending;
    }

    // Get similar songs based on genre/artist
    public Map<String, Object> getSimilarSongs(String songId, int limit) {
        Map<String, Object> similar = new HashMap<>();

        try {
            // Get song details
            Object song = songServiceClient.getSongById(songId);
            similar.put("referenceSong", song);

            // Get similar songs (same genre/artist)
            // This is simplified - would need more sophisticated algorithm
            similar.put("message", "Similar songs based on genre and artist");
            
        } catch (Exception e) {
            similar.put("error", "Failed to get similar songs: " + e.getMessage());
        }

        return similar;
    }

    // Get recommendations for new users (cold start problem)
    public Map<String, Object> getDefaultRecommendations(int limit) {
        Map<String, Object> defaults = new HashMap<>();

        try {
            // Return popular/trending songs for new users
            defaults.put("message", "Popular songs for new users");
            defaults.put("type", "default");
            defaults.put("limit", limit);
            
        } catch (Exception e) {
            defaults.put("error", "Failed to get default recommendations: " + e.getMessage());
        }

        return defaults;
    }

    // Get genre-based recommendations
    public Map<String, Object> getGenreBasedRecommendations(String genreId, int limit) {
        Map<String, Object> genreRecs = new HashMap<>();

        try {
            Object songs = songServiceClient.getSongsByGenre(genreId);
            genreRecs.put("genre", genreId);
            genreRecs.put("songs", songs);
            
        } catch (Exception e) {
            genreRecs.put("error", "Failed to get genre recommendations: " + e.getMessage());
        }

        return genreRecs;
    }

    // Discover new music (explore)
    public Map<String, Object> discoverNewMusic(String userId, int limit) {
        Map<String, Object> discover = new HashMap<>();

        try {
            // Get random/diverse songs that user hasn't listened to
            discover.put("message", "Discover new and diverse music");
            discover.put("type", "discovery");
            discover.put("limit", limit);
            
        } catch (Exception e) {
            discover.put("error", "Failed to discover new music: " + e.getMessage());
        }

        return discover;
    }

    // Get "Because you listened to X" recommendations
    public Map<String, Object> getBecauseYouListened(String userId, String songId, int limit) {
        Map<String, Object> because = new HashMap<>();

        try {
            // Get song details
            Object referenceSong = songServiceClient.getSongById(songId);
            because.put("referenceSong", referenceSong);
            
            // Get similar songs
            Map<String, Object> similar = getSimilarSongs(songId, limit);
            because.put("recommendations", similar);
            
        } catch (Exception e) {
            because.put("error", "Failed to generate recommendations: " + e.getMessage());
        }

        return because;
    }

    // Get daily mix (personalized playlist)
    public Map<String, Object> getDailyMix(String userId) {
        Map<String, Object> dailyMix = new HashMap<>();

        try {
            // Generate personalized daily playlist based on user's taste
            dailyMix.put("message", "Your Daily Mix");
            dailyMix.put("type", "daily-mix");
            
            // Get personalized recommendations
            Map<String, Object> personalized = getPersonalizedRecommendations(userId, 30);
            dailyMix.put("songs", personalized);
            
        } catch (Exception e) {
            dailyMix.put("error", "Failed to generate daily mix: " + e.getMessage());
        }

        return dailyMix;
    }
}

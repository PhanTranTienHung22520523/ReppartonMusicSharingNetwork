package com.DA2.recommendationservice.service;

import com.DA2.recommendationservice.client.*;
import com.DA2.recommendationservice.entity.UserRecommendation;
import com.DA2.recommendationservice.repository.UserRecommendationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private AnalyticsServiceClient analyticsServiceClient;

    @Autowired
    private AIServiceClient aiServiceClient;

    @Autowired
    private SongServiceClient songServiceClient;

    @Autowired
    private SocialServiceClient socialServiceClient;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private UserRecommendationRepository userRecommendationRepository;

    // Get personalized song recommendations for user
    public Map<String, Object> getPersonalizedRecommendations(String userId, int limit) {
        Map<String, Object> recommendations = new HashMap<>();

        try {
            // 0. Check cache first
            Optional<UserRecommendation> cached = userRecommendationRepository.findById(userId);
            if (cached.isPresent()) {
                List<String> songIds = cached.get().getRecommendedSongIds();
                if (songIds != null && !songIds.isEmpty()) {
                    List<Object> enrichedSongs = new ArrayList<>();
                    for (String songId : songIds) {
                        try {
                            Object songResp = songServiceClient.getSongById(songId);
                            if (songResp != null) {
                                // Extract data from ApiResponse if needed
                                if (songResp instanceof Map<?, ?> respMap) {
                                    Object songData = respMap.get("data");
                                    enrichedSongs.add(songData != null ? songData : songResp);
                                } else {
                                    enrichedSongs.add(songResp);
                                }
                            }
                        } catch (Exception e) {
                            System.out.println("Failed to enrich song " + songId + ": " + e.getMessage());
                        }
                    }
                    if (!enrichedSongs.isEmpty()) {
                        recommendations.put("recommendations", enrichedSongs);
                        recommendations.put("source", "cache");
                        return recommendations;
                    }
                }
            } else {
                System.out.println("No cache found for userId: " + userId);
            }

            // 1. Get user's listen history
            CompletableFuture<Object> listenHistoryFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return analyticsServiceClient.getUserListenHistory(userId, 50);
                } catch (Exception e) {
                    return null;
                }
            });
            
            // 2. Get user's search history
            CompletableFuture<Object> searchHistoryFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return analyticsServiceClient.getUserSearchHistory(userId);
                } catch (Exception e) {
                    return null;
                }
            });

            // 3. Get user preferred genres (for cold start)
            CompletableFuture<List<String>> preferredGenresFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    Map<String, Object> userProfile = userServiceClient.getUserById(userId);
                    if (userProfile != null && userProfile.containsKey("preferredGenres")) {
                        return (List<String>) userProfile.get("preferredGenres");
                    }
                } catch (Exception e) {
                    // Ignore user service failure
                }
                return null;
            });

            CompletableFuture.allOf(listenHistoryFuture, searchHistoryFuture, preferredGenresFuture).join();

            Object listenHistory = listenHistoryFuture.get();
            Object searchHistory = searchHistoryFuture.get();
            List<String> preferredGenres = preferredGenresFuture.get();

            // 4. Call AI Service for hybrid recommendations
            Map<String, Object> aiRequest = new HashMap<>();
            aiRequest.put("user_id", userId);
            aiRequest.put("listening_history", listenHistory);
            if (searchHistory != null) {
                aiRequest.put("search_history", searchHistory);
            }
            if (preferredGenres != null) {
                aiRequest.put("preferred_genres", preferredGenres);
            }
            aiRequest.put("limit", limit);

            Map<String, Object> aiResponse = aiServiceClient.getRecommendationsByUser(aiRequest);
            
            if (aiResponse != null && aiResponse.containsKey("recommendations")) {
                Object recsObj = aiResponse.get("recommendations");
                if (recsObj instanceof List<?> recsList) {
                    List<Object> enrichedSongs = new ArrayList<>();
                    List<String> songIdsToCache = new ArrayList<>();
                    
                    for (Object recObj : recsList) {
                        if (recObj instanceof Map<?, ?> rec) {
                            String songId = String.valueOf(rec.get("song_id"));
                            songIdsToCache.add(songId);
                            try {
                                Object songResp = songServiceClient.getSongById(songId);
                                if (songResp != null) {
                                    // Extract data from ApiResponse if needed
                                    if (songResp instanceof Map<?, ?> respMap) {
                                        Object songData = respMap.get("data");
                                        enrichedSongs.add(songData != null ? songData : songResp);
                                    } else {
                                        enrichedSongs.add(songResp);
                                    }
                                }
                            } catch (Exception e) {
                                System.out.println("Failed to enrich song " + songId + ": " + e.getMessage());
                            }
                        }
                    }
                    
                    // Save to cache
                    UserRecommendation userRec = UserRecommendation.builder()
                        .userId(userId)
                        .recommendedSongIds(songIdsToCache)
                        .updatedAt(LocalDateTime.now())
                        .build();
                    userRecommendationRepository.save(userRec);
                    
                    recommendations.put("recommendations", enrichedSongs);
                    recommendations.put("source", "fresh");
                } else {
                    recommendations.put("recommendations", recsObj);
                }
            } else {
                 recommendations.put("error", "AI service returned no recommendations");
            }

        } catch (Exception e) {
            recommendations.put("error", "Failed to generate recommendations: " + e.getMessage());
        }

        return recommendations;
    }

    // Refresh recommendations for a specific user (Async)
    public void refreshRecommendations(String userId) {
        CompletableFuture.runAsync(() -> {
            try {
                // Clear cache first to force fresh fetch
                // userRecommendationRepository.deleteById(userId); // Optional
                
                // Fetch fresh from AI (this will trigger save to cache)
                getPersonalizedRecommendations(userId, 20);
            } catch (Exception e) {
                // Log error
            }
        });
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
            // Return popular/trending songs for new users from analytics service
            Object trendingSongs = analyticsServiceClient.getTrendingSongs(limit);
            defaults.put("songs", trendingSongs);
            defaults.put("type", "default");
            defaults.put("limit", limit);
            
        } catch (Exception e) {
            defaults.put("error", "Failed to get default recommendations: " + e.getMessage());
            defaults.put("songs", Collections.emptyList());
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

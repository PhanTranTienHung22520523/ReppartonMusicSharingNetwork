package com.DA2.songservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Client for communicating with Python AI Service
 * Provides methods to call AI endpoints for music analysis and recommendations
 */
@Component
@Slf4j
public class AIServiceClient {

    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;
    
    @Value("${ai.service.enabled:true}")
    private boolean enabled;

    public AIServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Check if AI Service is available
     */
    public boolean isAvailable() {
        if (!enabled) {
            return false;
        }
        
        try {
            String url = aiServiceUrl + "/health";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            log.warn("AI Service health check failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Analyze music file to extract features (tempo, key, mood, energy, etc.)
     * 
     * @param audioUrl URL of the audio file to analyze
     * @return Map containing analysis results
     */
    public Map<String, Object> analyzeMusicFile(String audioUrl) {
        if (!enabled) {
            throw new IllegalStateException("AI Service is disabled");
        }
        
        try {
            String url = aiServiceUrl + "/api/ai/music/analyze";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("audio_url", audioUrl);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully analyzed music file: {}", audioUrl);
                return response.getBody();
            } else {
                throw new RuntimeException("AI Service returned non-OK status: " + response.getStatusCode());
            }
            
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("AI Service HTTP error: {} - {}", e.getStatusCode(), e.getMessage());
            throw new RuntimeException("Failed to analyze music: " + e.getMessage(), e);
        } catch (Exception e) {
            log.error("Failed to call AI Service: {}", e.getMessage());
            throw new RuntimeException("AI Service unavailable: " + e.getMessage(), e);
        }
    }

    /**
     * Get song recommendations based on a given song
     * 
     * @param songId ID of the song to base recommendations on
     * @param limit Number of recommendations to return
     * @return List of recommended song IDs
     */
    @SuppressWarnings("unchecked")
    public List<String> getRecommendationsBySong(String songId, int limit) {
        if (!enabled) {
            throw new IllegalStateException("AI Service is disabled");
        }
        
        try {
            String url = aiServiceUrl + "/api/ai/recommend/by-song";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("song_id", songId);
            requestBody.put("limit", limit);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully got recommendations for song: {}", songId);
                return (List<String>) response.getBody().get("recommended_songs");
            } else {
                throw new RuntimeException("AI Service returned non-OK status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to get recommendations: {}", e.getMessage());
            throw new RuntimeException("Failed to get recommendations: " + e.getMessage(), e);
        }
    }

    /**
     * Get song recommendations for a user based on their listening history
     * 
     * @param userId ID of the user
     * @param limit Number of recommendations to return
     * @return List of recommended song IDs
     */
    @SuppressWarnings("unchecked")
    public List<String> getRecommendationsByUser(String userId, int limit) {
        if (!enabled) {
            throw new IllegalStateException("AI Service is disabled");
        }
        
        try {
            String url = aiServiceUrl + "/api/ai/recommend/by-user";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("user_id", userId);
            requestBody.put("limit", limit);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully got recommendations for user: {}", userId);
                return (List<String>) response.getBody().get("recommended_songs");
            } else {
                throw new RuntimeException("AI Service returned non-OK status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to get user recommendations: {}", e.getMessage());
            throw new RuntimeException("Failed to get user recommendations: " + e.getMessage(), e);
        }
    }

    /**
     * Train recommendation model with user interaction data
     * 
     * @param interactions List of user-song interaction data
     * @return Training result status
     */
    public Map<String, Object> trainRecommendationModel(List<Map<String, Object>> interactions) {
        if (!enabled) {
            throw new IllegalStateException("AI Service is disabled");
        }
        
        try {
            String url = aiServiceUrl + "/api/ai/recommend/train";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("interactions", interactions);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully trained recommendation model");
                return response.getBody();
            } else {
                throw new RuntimeException("AI Service returned non-OK status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to train recommendation model: {}", e.getMessage());
            throw new RuntimeException("Failed to train model: " + e.getMessage(), e);
        }
    }

    /**
     * Verify artist authenticity using documents and social media
     * 
     * @param artistId ID of the artist to verify
     * @param documents Map containing document URLs and social media handles
     * @return Verification result with confidence score
     */
    public Map<String, Object> verifyArtist(String artistId, Map<String, Object> documents) {
        if (!enabled) {
            throw new IllegalStateException("AI Service is disabled");
        }
        
        try {
            String url = aiServiceUrl + "/api/ai/artist/verify";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("artist_id", artistId);
            requestBody.putAll(documents);
            
            HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url, 
                HttpMethod.POST, 
                request, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                log.info("Successfully verified artist: {}", artistId);
                return response.getBody();
            } else {
                throw new RuntimeException("AI Service returned non-OK status: " + response.getStatusCode());
            }
            
        } catch (Exception e) {
            log.error("Failed to verify artist: {}", e.getMessage());
            throw new RuntimeException("Failed to verify artist: " + e.getMessage(), e);
        }
    }
}

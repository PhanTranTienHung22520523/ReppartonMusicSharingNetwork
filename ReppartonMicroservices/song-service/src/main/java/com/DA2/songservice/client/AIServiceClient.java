package com.DA2.songservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
public class AIServiceClient {

    private static final Logger log = LoggerFactory.getLogger(AIServiceClient.class);

    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public boolean isAvailable() {
        try {
            String url = aiServiceUrl + "/health";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            return "healthy".equals(response.get("status"));
        } catch (Exception e) {
            log.warn("AI Service unavailable: {}", e.getMessage());
            return false;
        }
    }

    public Map<String, Object> analyzeMusicFile(String fileUrl) {
        String url = aiServiceUrl + "/api/ai/music/analyze";
        Map<String, String> request = Map.of("file_url", fileUrl);
        return restTemplate.postForObject(url, request, Map.class);
    }

    public Map<String, Object> extractLyrics(String fileUrl) {
        String url = aiServiceUrl + "/api/ai/music/extract-lyrics";
        Map<String, String> request = Map.of("file_url", fileUrl);
        return restTemplate.postForObject(url, request, Map.class);
    }

    public Map<String, Object> syncLyrics(String fileUrl, String lyrics) {
        String url = aiServiceUrl + "/api/ai/music/sync-lyrics";
        Map<String, String> request = Map.of("file_url", fileUrl, "lyrics", lyrics);
        return restTemplate.postForObject(url, request, Map.class);
    }

    public Map<String, Object> analyzeChords(String fileUrl) {
        String url = aiServiceUrl + "/api/ai/music/analyze-chords";
        Map<String, String> request = Map.of("file_url", fileUrl);
        return restTemplate.postForObject(url, request, Map.class);
    }
}
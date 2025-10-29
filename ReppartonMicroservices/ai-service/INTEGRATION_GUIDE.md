# AI Service Integration Guide for Java Microservices

## 🎯 Overview

This guide shows how to integrate the Python AI Service with your Java Spring Boot microservices.

## 📋 Integration Points

### 1. Song Service Integration (Music Analysis)
### 2. Recommendation Service Integration
### 3. User Service Integration (Artist Verification)

---

## 1️⃣ Song Service - Music Analysis Integration

### Step 1: Add RestTemplate Configuration

```java
// config/RestTemplateConfig.java
package com.repparton.songservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import java.time.Duration;

@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(120))  // Music analysis can take time
            .build();
    }
}
```

### Step 2: Create AI Service Client

```java
// service/AIServiceClient.java
package com.repparton.songservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;
    
    /**
     * Analyze audio file using AI service
     */
    public MusicAnalysisResult analyzeMusic(MultipartFile audioFile, String songId) {
        try {
            String url = aiServiceUrl + "/api/ai/music/analyze";
            
            // Prepare multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(audioFile.getBytes()) {
                @Override
                public String getFilename() {
                    return audioFile.getOriginalFilename();
                }
            });
            body.add("song_id", songId);
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            // Call AI service
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, 
                requestEntity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseBody = response.getBody();
                Map<String, Object> analysis = (Map<String, Object>) responseBody.get("analysis");
                
                return MusicAnalysisResult.fromMap(analysis);
            } else {
                log.error("AI service returned error: {}", response.getStatusCode());
                return null;
            }
            
        } catch (IOException e) {
            log.error("Error reading audio file: {}", e.getMessage());
            return null;
        } catch (Exception e) {
            log.error("Error calling AI service: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Extract detailed features for ML
     */
    public Map<String, Object> extractFeatures(MultipartFile audioFile) {
        try {
            String url = aiServiceUrl + "/api/ai/music/extract-features";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(audioFile.getBytes()) {
                @Override
                public String getFilename() {
                    return audioFile.getOriginalFilename();
                }
            });
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, 
                requestEntity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return (Map<String, Object>) response.getBody().get("features");
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("Error extracting features: {}", e.getMessage());
            return null;
        }
    }
}
```

### Step 3: Create Result Model

```java
// model/MusicAnalysisResult.java
package com.repparton.songservice.model;

import lombok.Data;
import lombok.Builder;
import java.util.Map;

@Data
@Builder
public class MusicAnalysisResult {
    private Double tempo;
    private String key;
    private Double energy;
    private Double danceability;
    private String mood;
    private Double acousticness;
    private Double instrumentalness;
    private Double valence;
    private Double loudness;
    private Double spectralCentroid;
    private Double zeroCrossingRate;
    
    public static MusicAnalysisResult fromMap(Map<String, Object> map) {
        return MusicAnalysisResult.builder()
            .tempo(getDouble(map, "tempo"))
            .key((String) map.get("key"))
            .energy(getDouble(map, "energy"))
            .danceability(getDouble(map, "danceability"))
            .mood((String) map.get("mood"))
            .acousticness(getDouble(map, "acousticness"))
            .instrumentalness(getDouble(map, "instrumentalness"))
            .valence(getDouble(map, "valence"))
            .loudness(getDouble(map, "loudness"))
            .spectralCentroid(getDouble(map, "spectral_centroid"))
            .zeroCrossingRate(getDouble(map, "zero_crossing_rate"))
            .build();
    }
    
    private static Double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return null;
    }
}
```

### Step 4: Update SongService

```java
// service/SongService.java
package com.repparton.songservice.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class SongService {
    
    private final AIServiceClient aiServiceClient;
    private final SongRepository songRepository;
    
    public Song uploadAndAnalyzeSong(MultipartFile audioFile, Song song) {
        // Save song first
        Song savedSong = songRepository.save(song);
        
        // Analyze with AI in background
        MusicAnalysisResult analysis = aiServiceClient.analyzeMusic(
            audioFile, 
            savedSong.getId()
        );
        
        if (analysis != null) {
            // Update song with analysis results
            Song.SongAnalysis songAnalysis = new Song.SongAnalysis();
            songAnalysis.setKey(analysis.getKey());
            songAnalysis.setTempo(analysis.getTempo());
            songAnalysis.setEnergy(analysis.getEnergy());
            songAnalysis.setDanceability(analysis.getDanceability());
            songAnalysis.setMood(analysis.getMood());
            
            savedSong.setAiAnalysis(songAnalysis);
            savedSong = songRepository.save(savedSong);
        }
        
        return savedSong;
    }
}
```

---

## 2️⃣ Recommendation Service Integration

### Step 1: Create AI Recommendation Client

```java
// service/AIRecommendationClient.java
package com.repparton.recommendationservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIRecommendationClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;
    
    /**
     * Get song recommendations based on audio features
     */
    public List<SongRecommendation> recommendBySong(
        String songId, 
        Map<String, Object> audioFeatures, 
        int limit
    ) {
        try {
            String url = aiServiceUrl + "/api/ai/recommend/by-song";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> request = new HashMap<>();
            request.put("song_id", songId);
            request.put("audio_features", audioFeatures);
            request.put("limit", limit);
            
            HttpEntity<Map<String, Object>> requestEntity = 
                new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, 
                requestEntity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> recommendations = 
                    (List<Map<String, Object>>) body.get("recommendations");
                
                return recommendations.stream()
                    .map(this::mapToRecommendation)
                    .toList();
            }
            
            return Collections.emptyList();
            
        } catch (Exception e) {
            log.error("Error getting recommendations: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    
    /**
     * Get personalized recommendations for user
     */
    public List<SongRecommendation> recommendByUser(
        String userId,
        List<ListeningHistory> listeningHistory,
        int limit
    ) {
        try {
            String url = aiServiceUrl + "/api/ai/recommend/by-user";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> request = new HashMap<>();
            request.put("user_id", userId);
            request.put("listening_history", listeningHistory);
            request.put("limit", limit);
            
            HttpEntity<Map<String, Object>> requestEntity = 
                new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, 
                requestEntity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> recommendations = 
                    (List<Map<String, Object>>) body.get("recommendations");
                
                return recommendations.stream()
                    .map(this::mapToRecommendation)
                    .toList();
            }
            
            return Collections.emptyList();
            
        } catch (Exception e) {
            log.error("Error getting user recommendations: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
    
    /**
     * Train recommendation model
     */
    public void trainModel(List<Map<String, Object>> songs, 
                          List<Map<String, Object>> interactions) {
        try {
            String url = aiServiceUrl + "/api/ai/recommend/train";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> request = new HashMap<>();
            request.put("songs", songs);
            request.put("interactions", interactions);
            
            HttpEntity<Map<String, Object>> requestEntity = 
                new HttpEntity<>(request, headers);
            
            restTemplate.postForEntity(url, requestEntity, Map.class);
            
            log.info("Recommendation model training initiated");
            
        } catch (Exception e) {
            log.error("Error training model: {}", e.getMessage());
        }
    }
    
    private SongRecommendation mapToRecommendation(Map<String, Object> map) {
        return SongRecommendation.builder()
            .songId((String) map.get("song_id"))
            .score(((Number) map.get("similarity_score")).doubleValue())
            .reason((String) map.get("reason"))
            .build();
    }
}
```

---

## 3️⃣ User Service - Artist Verification Integration

### Step 1: Create Artist Verification Client

```java
// service/ArtistVerificationAIClient.java
package com.repparton.userservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArtistVerificationAIClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url:http://localhost:5000}")
    private String aiServiceUrl;
    
    /**
     * Verify artist application using AI
     */
    public VerificationResult verifyArtistApplication(
        String userId,
        String artistName,
        String documentUrl,
        Map<String, String> socialMedia,
        int verifiedSongsCount,
        List<String> portfolioUrls
    ) {
        try {
            String url = aiServiceUrl + "/api/ai/artist/verify";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            Map<String, Object> request = new HashMap<>();
            request.put("user_id", userId);
            request.put("artist_name", artistName);
            request.put("document_url", documentUrl);
            request.put("social_media", socialMedia);
            request.put("verified_songs_count", verifiedSongsCount);
            request.put("portfolio_urls", portfolioUrls);
            
            HttpEntity<Map<String, Object>> requestEntity = 
                new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, 
                requestEntity, 
                Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                Map<String, Object> result = 
                    (Map<String, Object>) body.get("verification_result");
                
                return mapToVerificationResult(result);
            }
            
            return null;
            
        } catch (Exception e) {
            log.error("Error verifying artist: {}", e.getMessage());
            return null;
        }
    }
    
    private VerificationResult mapToVerificationResult(Map<String, Object> map) {
        return VerificationResult.builder()
            .confidenceScore(((Number) map.get("confidence_score")).doubleValue())
            .status((String) map.get("status"))
            .documentVerified((Boolean) map.get("document_verified"))
            .socialMediaVerified((Boolean) map.get("social_media_verified"))
            .portfolioVerified((Boolean) map.get("portfolio_verified"))
            .recommendation((String) map.get("recommendation"))
            .reason((String) map.get("reason"))
            .details((Map<String, Object>) map.get("details"))
            .build();
    }
}
```

### Step 2: Update AuthService

```java
// service/AuthService.java
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final ArtistVerificationAIClient aiClient;
    private final UserRepository userRepository;
    
    public User applyForArtistVerification(
        String userId,
        String artistName,
        String documentUrl,
        Map<String, String> socialMedia,
        List<String> portfolioUrls
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Count verified songs
        int verifiedSongsCount = user.getVerifiedSongsCount();
        
        // Call AI verification
        VerificationResult result = aiClient.verifyArtistApplication(
            userId,
            artistName,
            documentUrl,
            socialMedia,
            verifiedSongsCount,
            portfolioUrls
        );
        
        if (result != null) {
            // Update user based on AI result
            User.ArtistVerification verification = new User.ArtistVerification();
            verification.setArtistName(artistName);
            verification.setDocumentUrl(documentUrl);
            verification.setSocialMediaLinks(socialMedia);
            verification.setAiConfidenceScore(result.getConfidenceScore());
            
            // Apply AI recommendation
            if ("approved".equals(result.getStatus())) {
                user.setVerified(true);
                user.setArtistPending(false);
                verification.setStatus("approved");
            } else if ("pending".equals(result.getStatus())) {
                user.setVerified(false);
                user.setArtistPending(true);
                verification.setStatus("pending");
            } else {
                user.setVerified(false);
                user.setArtistPending(false);
                verification.setStatus("rejected");
                verification.setRejectionReason(result.getReason());
            }
            
            user.setArtistVerification(verification);
            return userRepository.save(user);
        }
        
        return user;
    }
}
```

---

## 🔧 Configuration

### application.yml

```yaml
# AI Service Configuration
ai:
  service:
    url: http://localhost:5000
    connect-timeout: 10000
    read-timeout: 120000
```

### application-docker.yml (for Docker deployment)

```yaml
ai:
  service:
    url: http://ai-service:5000
```

---

## 🚀 Deployment Notes

1. **Start AI Service First**: Ensure Python AI service is running before starting Java services
2. **Network Configuration**: If using Docker, ensure all services are on same network
3. **Timeout Configuration**: Music analysis can take 30-60 seconds, adjust timeouts
4. **Error Handling**: AI service might be unavailable, implement fallback logic
5. **Async Processing**: Consider using @Async for AI calls to avoid blocking

---

## 🧪 Testing

### Test Music Analysis

```java
@SpringBootTest
class AIServiceIntegrationTest {
    
    @Autowired
    private AIServiceClient aiServiceClient;
    
    @Test
    void testMusicAnalysis() {
        MockMultipartFile audioFile = new MockMultipartFile(
            "file",
            "test.mp3",
            "audio/mpeg",
            "test audio content".getBytes()
        );
        
        MusicAnalysisResult result = aiServiceClient.analyzeMusic(
            audioFile, 
            "test-song-id"
        );
        
        assertNotNull(result);
        assertNotNull(result.getTempo());
        assertNotNull(result.getKey());
    }
}
```

---

## 📞 Support

For issues with AI service integration, check:
1. AI service health endpoint: `http://localhost:5000/health`
2. Network connectivity between services
3. Timeout configurations
4. Log files for error details

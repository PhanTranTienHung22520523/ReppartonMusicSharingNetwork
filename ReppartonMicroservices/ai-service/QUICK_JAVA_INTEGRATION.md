# 🔗 Quick Java Integration Steps

## Tích Hợp AI Service Vào Các Service Hiện Tại

### 1️⃣ Song Service - Thêm Music Analysis

#### Step 1: Thêm vào `application.yml`
```yaml
# song-service/src/main/resources/application.yml
ai:
  service:
    url: http://localhost:5000
    enabled: true
```

#### Step 2: Tạo `AIServiceClient.java` trong package `service`
```java
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
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AIServiceClient {
    
    private final RestTemplate restTemplate;
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    @Value("${ai.service.enabled:false}")
    private boolean enabled;
    
    public Map<String, Object> analyzeMusic(MultipartFile audioFile, String songId) {
        if (!enabled) {
            log.warn("AI service is disabled");
            return null;
        }
        
        try {
            String url = aiServiceUrl + "/api/ai/music/analyze";
            
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
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, requestEntity, Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                return (Map<String, Object>) response.getBody().get("analysis");
            }
            
        } catch (Exception e) {
            log.error("Error calling AI service: {}", e.getMessage());
        }
        
        return null;
    }
}
```

#### Step 3: Update `SongService.java`
```java
@Service
@RequiredArgsConstructor
public class SongService {
    
    private final AIServiceClient aiServiceClient;
    private final SongRepository songRepository;
    
    public Song createSongWithAnalysis(Song song, MultipartFile audioFile) {
        // Save song first
        Song savedSong = songRepository.save(song);
        
        // Call AI analysis (async recommended)
        try {
            Map<String, Object> analysis = aiServiceClient.analyzeMusic(
                audioFile, 
                savedSong.getId()
            );
            
            if (analysis != null) {
                // Update song with AI analysis
                Song.SongAnalysis aiAnalysis = new Song.SongAnalysis();
                aiAnalysis.setTempo(getDouble(analysis, "tempo"));
                aiAnalysis.setKey((String) analysis.get("key"));
                aiAnalysis.setEnergy(getDouble(analysis, "energy"));
                aiAnalysis.setMood((String) analysis.get("mood"));
                
                savedSong.setAiAnalysis(aiAnalysis);
                savedSong = songRepository.save(savedSong);
                
                log.info("Song analyzed: tempo={}, key={}, mood={}", 
                    aiAnalysis.getTempo(), aiAnalysis.getKey(), aiAnalysis.getMood());
            }
        } catch (Exception e) {
            log.error("Error analyzing song: {}", e.getMessage());
            // Continue without analysis
        }
        
        return savedSong;
    }
    
    private Double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value instanceof Number ? ((Number) value).doubleValue() : null;
    }
}
```

---

### 2️⃣ User Service - Thêm Artist Verification

#### Step 1: Thêm vào `application.yml`
```yaml
# user-service/src/main/resources/application.yml
ai:
  service:
    url: http://localhost:5000
    enabled: true
```

#### Step 2: Tạo `ArtistVerificationAIClient.java`
```java
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
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    @Value("${ai.service.enabled:false}")
    private boolean enabled;
    
    public Map<String, Object> verifyArtist(
        String userId,
        String artistName,
        String documentUrl,
        Map<String, String> socialMedia,
        int verifiedSongsCount
    ) {
        if (!enabled) {
            log.warn("AI service is disabled");
            return createManualReviewResult();
        }
        
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
            request.put("portfolio_urls", new ArrayList<>());
            
            HttpEntity<Map<String, Object>> requestEntity = 
                new HttpEntity<>(request, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(
                url, requestEntity, Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                return (Map<String, Object>) body.get("verification_result");
            }
            
        } catch (Exception e) {
            log.error("Error calling AI verification: {}", e.getMessage());
        }
        
        return createManualReviewResult();
    }
    
    private Map<String, Object> createManualReviewResult() {
        Map<String, Object> result = new HashMap<>();
        result.put("confidence_score", 0.5);
        result.put("status", "pending");
        result.put("recommendation", "Manual review");
        result.put("reason", "AI service unavailable");
        return result;
    }
}
```

#### Step 3: Update `AuthService.java`
```java
@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final ArtistVerificationAIClient aiClient;
    private final UserRepository userRepository;
    
    public User applyForArtistVerification(
        String userId,
        String artistName,
        String documentUrl,
        Map<String, String> socialMedia
    ) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Call AI verification
        Map<String, Object> verification = aiClient.verifyArtist(
            userId,
            artistName,
            documentUrl,
            socialMedia,
            user.getVerifiedSongsCount()
        );
        
        String status = (String) verification.get("status");
        double confidenceScore = ((Number) verification.get("confidence_score")).doubleValue();
        
        // Create verification object
        User.ArtistVerification artistVerification = new User.ArtistVerification();
        artistVerification.setArtistName(artistName);
        artistVerification.setDocumentUrl(documentUrl);
        artistVerification.setSocialMediaLinks(socialMedia);
        artistVerification.setAiConfidenceScore(confidenceScore);
        artistVerification.setStatus(status);
        
        // Apply AI decision
        if ("approved".equals(status)) {
            user.setVerified(true);
            user.setArtistPending(false);
            log.info("Artist auto-approved: {} (score: {})", artistName, confidenceScore);
        } else if ("rejected".equals(status)) {
            user.setVerified(false);
            user.setArtistPending(false);
            artistVerification.setRejectionReason(
                (String) verification.get("reason")
            );
            log.info("Artist auto-rejected: {} (score: {})", artistName, confidenceScore);
        } else {
            user.setVerified(false);
            user.setArtistPending(true);
            log.info("Artist pending review: {} (score: {})", artistName, confidenceScore);
        }
        
        user.setArtistVerification(artistVerification);
        return userRepository.save(user);
    }
}
```

---

### 3️⃣ Recommendation Service - Thêm AI Recommendations

#### Step 1: Thêm vào `application.yml`
```yaml
# recommendation-service/src/main/resources/application.yml
ai:
  service:
    url: http://localhost:5000
    enabled: true
```

#### Step 2: Tạo `AIRecommendationClient.java`
```java
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
    
    @Value("${ai.service.url}")
    private String aiServiceUrl;
    
    @Value("${ai.service.enabled:false}")
    private boolean enabled;
    
    public List<String> recommendSongs(
        String userId,
        List<Map<String, Object>> listeningHistory,
        int limit
    ) {
        if (!enabled) {
            log.warn("AI service is disabled");
            return Collections.emptyList();
        }
        
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
                url, requestEntity, Map.class
            );
            
            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> body = response.getBody();
                List<Map<String, Object>> recommendations = 
                    (List<Map<String, Object>>) body.get("recommendations");
                
                return recommendations.stream()
                    .map(rec -> (String) rec.get("song_id"))
                    .toList();
            }
            
        } catch (Exception e) {
            log.error("Error getting AI recommendations: {}", e.getMessage());
        }
        
        return Collections.emptyList();
    }
}
```

---

## 🔧 Common Configuration

### Add to all services' `pom.xml` (if not already present):
```xml
<!-- No additional dependencies needed - RestTemplate is in spring-web -->
```

### Create `RestTemplateConfig.java` in each service:
```java
@Configuration
public class RestTemplateConfig {
    
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
            .setConnectTimeout(Duration.ofSeconds(10))
            .setReadTimeout(Duration.ofSeconds(120))
            .build();
    }
}
```

---

## 🚀 Testing Integration

### 1. Start AI Service
```bash
cd ai-service
start.bat  # or ./start.sh
```

### 2. Test Health
```bash
curl http://localhost:5000/health
```

### 3. Start Your Java Services
```bash
cd song-service
mvn spring-boot:run
```

### 4. Test Integration
Upload a song with audio file - AI analysis should happen automatically!

---

## 🐛 Troubleshooting

### AI Service Not Responding
```yaml
# Disable AI temporarily
ai:
  service:
    enabled: false
```

### Timeout Errors
```yaml
# Increase timeout in RestTemplateConfig
.setReadTimeout(Duration.ofSeconds(180))
```

### Connection Refused
- Check if AI service is running: `curl http://localhost:5000/health`
- Check port conflicts
- Check firewall settings

---

## 📝 Next Steps

1. ✅ Start AI service
2. ⬜ Add configuration to each Java service
3. ⬜ Create AI client classes
4. ⬜ Update service methods to call AI
5. ⬜ Test with real data
6. ⬜ Monitor logs for errors

---

**See `INTEGRATION_GUIDE.md` for complete examples!**

package com.DA2.songservice.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
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
        return postMultipartFromUrl(url, fileUrl, null);
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

    public Map<String, Object> analyzeChords(String fileUrl, String songId) {
        return analyzeChords(fileUrl, songId, false);
    }

    public Map<String, Object> analyzeChords(String fileUrl, String songId, boolean dominantOnly) {
        // First try: ask AI service to fetch the file by URL itself (new endpoint)
        String urlBy = aiServiceUrl + "/api/ai/music/analyze-chords-url";
        try {
            Map<String, Object> req = Map.of("file_url", fileUrl, "song_id", songId == null ? "" : songId, "compact", dominantOnly);
            Map<String, Object> resp = restTemplate.postForObject(urlBy, req, Map.class);
            if (resp != null && (resp.containsKey("chord_analysis") || resp.containsKey("dominant_loop"))) {
                return resp;
            }
        } catch (Exception e) {
            log.warn("analyze-chords-url primary attempt failed, will try multipart fallback: {}", e.getMessage());
        }

        // Next try original multipart upload flow
        String url = aiServiceUrl + "/api/ai/music/analyze-chords";
        try {
            // If dominantOnly requested, pass form field 'compact' to the multipart endpoint
            Map<String, Object> response = postMultipartFromUrl(url, fileUrl, songId);
            if (response != null && (response.containsKey("chord_analysis") || response.containsKey("chords") || response.containsKey("dominant_loop"))) {
                return response;
            }
        } catch (Exception e) {
            log.warn("analyze-chords primary endpoint failed, will try fallback analyze endpoint: {}", e.getMessage());
        }

        // Fallback: call the general analyze endpoint and try to map its output
        try {
            Map<String, Object> analyzeResp = analyzeMusicFile(fileUrl);
            if (analyzeResp != null) {
                Object analysisObj = analyzeResp.get("analysis");
                if (analysisObj instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> analysis = (Map<String, Object>) analysisObj;
                    if (analysis.containsKey("chords")) {
                        return Map.of(
                                "song_id", analyzeResp.get("song_id"),
                                "chord_analysis", analysis.get("chords"),
                                "status", "success"
                        );
                    }
                    if (analysis.containsKey("chord_analysis")) {
                        return Map.of(
                                "song_id", analyzeResp.get("song_id"),
                                "chord_analysis", analysis.get("chord_analysis"),
                                "status", "success"
                        );
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Fallback analyze endpoint failed: {}", e.getMessage());
        }

        throw new RuntimeException("AI request failed: chord analysis not available from AI service");
    }

    private Map<String, Object> postMultipartFromUrl(String endpointUrl, String fileUrl, String songId) {
        try {
            // Try to download the audio bytes and log the response status and size
            org.springframework.http.ResponseEntity<byte[]> downloadResp = restTemplate.getForEntity(fileUrl, byte[].class);
            org.springframework.http.HttpStatusCode downloadStatus = downloadResp.getStatusCode();
            byte[] bytes = downloadResp.getBody();
            int byteLen = bytes == null ? 0 : bytes.length;
            log.warn("Downloaded file from {} - status: {}, bytes: {}", fileUrl, downloadStatus, byteLen);
            if (bytes == null || bytes.length == 0) {
                throw new RuntimeException("Failed to download audio bytes (empty response)");
            }

            String filename = "audio";
            try {
                URI uri = URI.create(fileUrl);
                String path = uri.getPath();
                if (path != null && !path.isBlank()) {
                    String last = path.substring(path.lastIndexOf('/') + 1);
                    if (!last.isBlank()) filename = last;
                }
            } catch (Exception ignored) {
                // best-effort
            }

            final String finalFilename = filename;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(bytes) {
                @Override
                public String getFilename() {
                    return finalFilename;
                }
            };
            body.add("file", resource);
            if (songId != null && !songId.isBlank()) {
                body.add("song_id", songId);
            }

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            // use WARN so the message is visible in default log configuration
            log.warn("Posting to AI endpoint: {} (fileUrl={})", endpointUrl, fileUrl);
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(endpointUrl, requestEntity, Map.class);
                log.info("AI response status: {} for endpoint {}", response.getStatusCode(), endpointUrl);
                return response.getBody();
            } catch (org.springframework.web.client.HttpStatusCodeException hsce) {
                String respBody = hsce.getResponseBodyAsString();
                org.springframework.http.HttpStatusCode status = hsce.getStatusCode();
                log.warn("AI request to {} failed with status {} and body: {}", endpointUrl, status, respBody);
                throw new RuntimeException("AI request failed: " + status + ": " + respBody, hsce);
            }
        } catch (Exception e) {
            throw new RuntimeException("AI request failed: " + e.getMessage(), e);
        }
    }
}
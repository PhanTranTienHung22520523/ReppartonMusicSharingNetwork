package com.DA2.songservice.service;

import com.DA2.songservice.client.AIServiceClient;
import com.DA2.songservice.entity.Song;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class SongAIService {

    private static final Logger log = LoggerFactory.getLogger(SongAIService.class);
    private final AIServiceClient aiServiceClient;
    
    public SongAIService(AIServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    public Song.SongAnalysis analyzeSong(String fileUrl) {
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service unavailable, skipping analysis");
            return null;
        }

        try {
            Map<String, Object> response = aiServiceClient.analyzeMusicFile(fileUrl);
            if (response == null) return null;

            // Python AI service returns { status, song_id, analysis: { tempo, key, mood, energy, danceability, ... } }
            Map<String, Object> data = (Map<String, Object>) response.get("analysis");
            if (data == null) {
                // Legacy/alternate formats
                data = (Map<String, Object>) response.get("data");
            }
            if (data == null) return null;

            // Try to extract common fields with fallbacks
            Double bpm = getDouble(data, "bpm");
            if (bpm == null) bpm = getDouble(data, "tempo");

            String key = (String) data.get("key");
            String mood = (String) data.get("mood");
            Double energy = getDouble(data, "energy");
            Double danceability = getDouble(data, "danceability");

            // If some fields are missing, try a broader recursive search in the whole response
            if (bpm == null || key == null || mood == null || energy == null || danceability == null) {
                // attempt to find anywhere
                bpm = coalesce(bpm, findDoubleInMap(response, "bpm", "tempo"));
                key = coalesce(key, findStringInMap(response, "key"));
                mood = coalesce(mood, findStringInMap(response, "mood"));
                energy = coalesce(energy, findDoubleInMap(response, "energy"));
                danceability = coalesce(danceability, findDoubleInMap(response, "danceability"));
            }

            return Song.SongAnalysis.builder()
                    .bpm(bpm)
                    .key(key)
                    .mood(mood)
                    .energy(energy)
                    .danceability(danceability)
                    .analyzedAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Failed to analyze song: {}", e.getMessage());
            return null;
        }
    }

    public Map<String, Object> analyzeMusicRaw(String fileUrl) {
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service unavailable (raw), skipping analysis");
            return null;
        }
        try {
            Map<String, Object> response = aiServiceClient.analyzeMusicFile(fileUrl);
            log.info("AI raw music analysis: {}", response);
            return response;
        } catch (Exception e) {
            log.error("Failed to fetch raw music analysis: {}", e.getMessage());
            return null;
        }
    }

    private <T> T coalesce(T a, T b) {
        return a != null ? a : b;
    }

    // recursive search helpers
    private String findStringInMap(Map<String, Object> map, String... keys) {
        Object v = findInMap(map, keys);
        return v == null ? null : String.valueOf(v);
    }

    private Double findDoubleInMap(Map<String, Object> map, String... keys) {
        Object v = findInMap(map, keys);
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).doubleValue();
        try { return Double.parseDouble(String.valueOf(v)); } catch (Exception e) { return null; }
    }

    private Object findInMap(Object node, String... keys) {
        if (node == null) return null;
        try {
            if (node instanceof Map<?, ?> m) {
                for (String k : keys) {
                    if (m.containsKey(k)) return m.get(k);
                }
                for (Object val : m.values()) {
                    Object found = findInMap(val, keys);
                    if (found != null) return found;
                }
            } else if (node instanceof List<?> l) {
                for (Object item : l) {
                    Object found = findInMap(item, keys);
                    if (found != null) return found;
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    public String extractLyrics(String fileUrl) {
        if (!aiServiceClient.isAvailable()) {
            return null;
        }

        try {
            Map<String, Object> response = aiServiceClient.extractLyrics(fileUrl);
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            return (String) data.get("lyrics");
        } catch (Exception e) {
            log.error("Failed to extract lyrics: {}", e.getMessage());
            return null;
        }
    }

    public List<Song.LyricLine> generateSyncedLyrics(String fileUrl, String lyrics) {
        if (!aiServiceClient.isAvailable()) {
            return new ArrayList<>();
        }

        try {
            Map<String, Object> response = aiServiceClient.syncLyrics(fileUrl, lyrics);
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            List<Map<String, Object>> lines = (List<Map<String, Object>>) data.get("synced_lyrics");

            List<Song.LyricLine> syncedLyrics = new ArrayList<>();
            for (Map<String, Object> line : lines) {
                syncedLyrics.add(Song.LyricLine.builder()
                        .timestamp(getDouble(line, "timestamp"))
                        .text((String) line.get("text"))
                        .build());
            }
            return syncedLyrics;
        } catch (Exception e) {
            log.error("Failed to sync lyrics: {}", e.getMessage());
            return new ArrayList<>();
        }
    }

    public Song.ChordAnalysis analyzeSongChords(String fileUrl, String songId) {
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service unavailable, skipping chord analysis for songId={}", songId);
            return null;
        }

        try {
            Map<String, Object> response = aiServiceClient.analyzeChords(fileUrl, songId);
            log.info("AI chord analysis raw response for songId={}: {}", songId, response);
            if (response == null) return null;

            // Python AI service returns { status, song_id, chord_analysis: { progression: [{chord,start_time,confidence}, ...], ... } }
            Map<String, Object> chordAnalysis = (Map<String, Object>) response.get("chord_analysis");
            if (chordAnalysis == null) {
                // Legacy/alternate formats
                Map<String, Object> data = (Map<String, Object>) response.get("data");
                if (data != null) chordAnalysis = (Map<String, Object>) data.get("chord_analysis");
            }
            if (chordAnalysis == null) {
                log.warn("AI response missing chord_analysis for songId={}", songId);
                return null;
            }

            List<Map<String, Object>> progression = (List<Map<String, Object>>) chordAnalysis.get("progression");
            if (progression == null) {
                log.warn("AI chord_analysis missing progression for songId={}", songId);
                return null;
            }

            List<Song.Chord> chordList = new ArrayList<>();
            for (Map<String, Object> chord : progression) {
                chordList.add(Song.Chord.builder()
                        .timestamp(getDouble(chord, "start_time"))
                        .chord((String) chord.get("chord"))
                        .confidence(getDouble(chord, "confidence"))
                        .build());
            }

            // Attempt to extract dominant_loop if provided by AI
            Map<String, Object> dominantLoop = null;
            try {
                Object dl = chordAnalysis.get("dominant_loop");
                if (dl instanceof Map) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> dlm = (Map<String, Object>) dl;
                    dominantLoop = dlm;
                }
            } catch (Exception ignored) {}

            return Song.ChordAnalysis.builder()
                    .chords(chordList)
                    .dominantLoop(dominantLoop)
                    .analyzedAt(LocalDateTime.now())
                    .build();
    } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
        log.error("AI Service Bad Request (400) for songId={}: {}", songId, e.getResponseBodyAsString());
        // Return null or rethrow a specific custom exception if we want to bubble up the message
        throw new RuntimeException("AI Analysis failed: " + e.getResponseBodyAsString());
    } catch (Exception e) {
        log.error("Failed to analyze chords for songId={}: {}", songId, e.getMessage());
        return null; // Return null so the controller can handle it gracefully or return partial data
    }
}

    /**
     * Request AI to return only dominant loop (compact response) when supported.
     */
    public Song.ChordAnalysis analyzeDominantLoop(String fileUrl, String songId) {
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service unavailable, skipping dominant loop analysis for songId={}", songId);
            return null;
        }

        try {
            Map<String, Object> response = aiServiceClient.analyzeChords(fileUrl, songId, true);
            log.info("AI dominant-loop raw response for songId={}: {}", songId, response);
            if (response == null) return null;

            // AI compact response may return 'dominant_loop' directly
            Object dlObj = response.get("dominant_loop");
            Map<String, Object> dominantLoop = null;
            if (dlObj instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> dl = (Map<String, Object>) dlObj;
                dominantLoop = dl;
            }

            Song.ChordAnalysis.Builder builder = Song.ChordAnalysis.builder()
                    .dominantLoop(dominantLoop)
                    .analyzedAt(java.time.LocalDateTime.now());

            return builder.build();
    } catch (org.springframework.web.client.HttpClientErrorException.BadRequest e) {
        log.error("AI Service Bad Request (400) for dominant loop, songId={}: {}", songId, e.getResponseBodyAsString());
        return null; // Swallow for dominant loop as it's optional
    } catch (Exception e) {
        log.error("Failed to fetch dominant loop for songId={}: {}", songId, e.getMessage());
        return null;
    }
}

    public Map<String, Object> analyzeChordsRaw(String fileUrl, String songId) {
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service unavailable (raw), skipping for songId={}", songId);
            return null;
        }

        try {
            Map<String, Object> response = aiServiceClient.analyzeChords(fileUrl, songId);
            log.info("AI chord analysis raw (direct) for songId={}: {}", songId, response);
            return response;
        } catch (Exception e) {
            log.error("Failed to fetch raw chord analysis for songId={}: {}", songId, e.getMessage());
            return null;
        }
    }

    private Double getDouble(Map<String, Object> map, String key) {
        try {
            if (map == null) return null;
            Object value = map.get(key);
            if (value == null) return null;
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            String s = String.valueOf(value);
            if (s.isBlank()) return null;
            return Double.parseDouble(s);
        } catch (Exception e) {
            return null;
        }
    }

    // Public helpers for other services to extract values from nested AI responses
    public Double getDoubleFromMap(Map<String, Object> map, String key) {
        // try direct then recursive search
        Double direct = getDouble(map, key);
        if (direct != null) return direct;
        return findDoubleInMap(map, key);
    }

    public String getStringFromMap(Map<String, Object> map, String key) {
        if (map == null) return null;
        Object v = map.get(key);
        if (v != null) return String.valueOf(v);
        return findStringInMap(map, key);
    }
}
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
            Map<String, Object> data = (Map<String, Object>) response.get("data");

            return Song.SongAnalysis.builder()
                    .bpm(getDouble(data, "bpm"))
                    .key((String) data.get("key"))
                    .mood((String) data.get("mood"))
                    .energy(getDouble(data, "energy"))
                    .danceability(getDouble(data, "danceability"))
                    .analyzedAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Failed to analyze song: {}", e.getMessage());
            return null;
        }
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

    public Song.ChordAnalysis analyzeSongChords(String fileUrl) {
        if (!aiServiceClient.isAvailable()) {
            return null;
        }

        try {
            Map<String, Object> response = aiServiceClient.analyzeChords(fileUrl);
            Map<String, Object> data = (Map<String, Object>) response.get("data");
            List<Map<String, Object>> chords = (List<Map<String, Object>>) data.get("chords");

            List<Song.Chord> chordList = new ArrayList<>();
            for (Map<String, Object> chord : chords) {
                chordList.add(Song.Chord.builder()
                        .timestamp(getDouble(chord, "timestamp"))
                        .chord((String) chord.get("chord"))
                        .confidence(getDouble(chord, "confidence"))
                        .build());
            }

            return Song.ChordAnalysis.builder()
                    .chords(chordList)
                    .analyzedAt(LocalDateTime.now())
                    .build();
        } catch (Exception e) {
            log.error("Failed to analyze chords: {}", e.getMessage());
            return null;
        }
    }

    private Double getDouble(Map<String, Object> map, String key) {
        Object value = map.get(key);
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return 0.0;
    }
}
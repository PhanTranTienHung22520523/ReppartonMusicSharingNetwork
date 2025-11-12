package com.DA2.songservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "songs")
public class Song {
    @Id
    private String id;
    private String title;
    private String artist;
    private String fileUrl;
    private String coverImageUrl;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long duration; // in seconds
    
    @Builder.Default
    private Integer likesCount = 0;
    @Builder.Default
    private Integer playsCount = 0;
    @Builder.Default
    private Integer commentsCount = 0;
    @Builder.Default
    private Integer sharesCount = 0;
    
    private List<String> genres;
    private String description;
    private boolean isPublic = true;
    private boolean isActive = true;
    
    // Lyric support
    private String lyrics; // Full lyrics text
    private List<LyricLine> syncedLyrics; // Timestamped lyrics
    
    // AI Analysis results
    private SongAnalysis aiAnalysis;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LyricLine {
        private Long timestamp; // milliseconds
        private String text;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SongAnalysis {
        private String key; // Musical key (e.g., "C Major", "A Minor")
        private Integer tempo; // BPM
        private String mood; // e.g., "happy", "sad", "energetic"
        private Double energy; // 0.0 - 1.0
        private Double danceability; // 0.0 - 1.0
        private Boolean copyrightDetected;
        private String copyrightOwner;
        private LocalDateTime analyzedAt;
        
        // Chord Analysis
        private ChordAnalysis chordAnalysis;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChordAnalysis {
        private List<ChordSegment> progression; // Chord progression over time
        private List<String> uniqueChords; // List of unique chords used
        private Integer chordCount; // Total number of chord segments
        private Double averageConfidence; // Average chord detection confidence
        private ProgressionAnalysis progressionAnalysis; // Analysis of chord patterns
        private KeyCompatibility keyCompatibility; // How well chords fit the key
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChordSegment {
        private String chord; // Chord name (e.g., "C", "Am", "Fmaj7")
        private Double startTime; // Start time in seconds
        private Double confidence; // Detection confidence (0.0-1.0)
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProgressionAnalysis {
        private java.util.Map<String, Integer> chordFrequencies; // Frequency of each chord
        private String tonicChord; // Most common chord (usually tonic)
        private java.util.Map<String, Integer> commonTransitions; // Common chord transitions
        private Double complexityScore; // Progression complexity (0.0-1.0)
        private Integer progressionLength; // Total segments in progression
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class KeyCompatibility {
        private String bestMatchingKey; // Best matching musical key
        private Double compatibilityScore; // Compatibility score (0.0-1.0)
        private java.util.Map<String, Double> allCompatibilities; // Compatibility with all keys
    }
}

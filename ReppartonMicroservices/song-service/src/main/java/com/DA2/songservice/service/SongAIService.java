package com.DA2.songservice.service;

import com.DA2.songservice.client.AIServiceClient;
import com.DA2.songservice.entity.Song;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

/**
 * AI Service for analyzing songs
 * Integrates with Python AI Service (Flask) for real music analysis
 * Falls back to mock data if AI Service is unavailable
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SongAIService {

    private final Random random = new Random();
    private final AIServiceClient aiServiceClient;

    /**
     * Analyze song audio file and extract musical features
     * Calls Python AI Service for real analysis
     */
    public Song.SongAnalysis analyzeSong(String fileUrl) {
        // Check if AI Service is available
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service is not available, using mock analysis");
            return generateMockAnalysis();
        }
        
        try {
            log.info("Calling AI Service to analyze song: {}", fileUrl);
            
            // Call AI Service
            Map<String, Object> response = aiServiceClient.analyzeMusicFile(fileUrl);
            Map<String, Object> analysis = (Map<String, Object>) response.get("analysis");
            
            if (analysis != null) {
                log.info("AI Analysis successful for song: {}", fileUrl);
                
                // Analyze chords if available
                Song.ChordAnalysis chordAnalysis = null;
                try {
                    Map<String, Object> chordResponse = aiServiceClient.analyzeChords(fileUrl);
                    Map<String, Object> chordData = (Map<String, Object>) chordResponse.get("chord_analysis");
                    if (chordData != null) {
                        chordAnalysis = parseChordAnalysis(chordData);
                        log.info("Chord analysis successful for song: {}", fileUrl);
                    }
                } catch (Exception e) {
                    log.warn("Chord analysis failed, continuing without chords: {}", e.getMessage());
                }
                
                return Song.SongAnalysis.builder()
                        .key((String) analysis.getOrDefault("key", "C Major"))
                        .tempo(((Number) analysis.getOrDefault("tempo", 120)).intValue())
                        .mood((String) analysis.getOrDefault("mood", "neutral"))
                        .energy(((Number) analysis.getOrDefault("energy", 0.5)).doubleValue())
                        .danceability(((Number) analysis.getOrDefault("danceability", 0.5)).doubleValue())
                        .copyrightDetected(false) // TODO: Implement copyright detection
                        .copyrightOwner(null)
                        .analyzedAt(LocalDateTime.now())
                        .chordAnalysis(chordAnalysis)
                        .build();
            } else {
                log.warn("AI Service returned empty analysis");
                return generateMockAnalysis();
            }
            
        } catch (Exception e) {
            log.error("Failed to call AI Service: {}", e.getMessage());
            return generateMockAnalysis();
        }
    }
    
    /**
     * Generate mock analysis as fallback
     */
    private Song.SongAnalysis generateMockAnalysis() {
        String[] keys = {"C Major", "C Minor", "D Major", "D Minor", "E Major", "E Minor", 
                        "F Major", "F Minor", "G Major", "G Minor", "A Major", "A Minor", 
                        "B Major", "B Minor"};
        String[] moods = {"happy", "sad", "energetic", "calm", "romantic", "melancholic", "upbeat"};
        
        return Song.SongAnalysis.builder()
                .key(keys[random.nextInt(keys.length)])
                .tempo(60 + random.nextInt(140)) // BPM: 60-200
                .mood(moods[random.nextInt(moods.length)])
                .energy(0.3 + random.nextDouble() * 0.7) // 0.3-1.0
                .danceability(0.2 + random.nextDouble() * 0.8) // 0.2-1.0
                .copyrightDetected(random.nextBoolean())
                .copyrightOwner(random.nextBoolean() ? "Unknown Label" : null)
                .analyzedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Extract lyrics from audio using speech-to-text AI
     * In production: integrate with Whisper AI, Google Cloud Speech-to-Text, etc.
     */
    public String extractLyrics(String fileUrl) {
        // Input validation
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("File URL cannot be null or empty");
        }

        // Check if AI Service is available for lyric extraction
        if (aiServiceClient.isAvailable()) {
            try {
                log.info("Attempting to extract lyrics from audio: {}", fileUrl);

                // Call AI Service for lyric extraction
                Map<String, Object> response = aiServiceClient.extractLyrics(fileUrl);
                String extractedLyrics = (String) response.get("lyrics");

                if (extractedLyrics != null && !extractedLyrics.trim().isEmpty()) {
                    log.info("Successfully extracted lyrics from AI Service");
                    return extractedLyrics.trim();
                } else {
                    log.warn("AI Service returned empty lyrics for: {}", fileUrl);
                }
            } catch (Exception e) {
                log.error("AI Service lyric extraction failed for {}: {}", fileUrl, e.getMessage());
                // Continue to fallback instead of throwing
            }
        } else {
            log.warn("AI Service not available, using fallback lyric extraction");
        }

        // Fallback to enhanced mock lyrics extraction
        log.info("Using enhanced mock lyric extraction for: {}", fileUrl);
        return generateEnhancedMockLyrics();
    }

    /**
     * Generate enhanced mock lyrics with realistic structure and themes
     */
    private String generateEnhancedMockLyrics() {
        // Different song themes and structures
        String[][] themes = {
            // Pop/Rock theme
            {
                "[Verse 1]\nUnder city lights we found our way\nChasing dreams that never fade away\nEvery heartbeat syncs with the night\nIn this moment, everything feels right",
                "[Chorus]\nWe dance until the morning light\nHold on tight, we'll be alright\nThis feeling's taking over me\nYou're the fire that sets me free",
                "[Verse 2]\nMemories painted in shades of gold\nStories waiting to be told\nThrough the storms and the pouring rain\nLove remains, breaking every chain",
                "[Bridge]\nWhen the world tries to bring us down\nWe'll stand tall, won't back down\nTogether we'll face the unknown\nBuilding dreams on our own"
            },
            // R&B/Soul theme
            {
                "[Verse 1]\nMidnight whispers in the dark\nSparks fly when our worlds collide\nEvery touch ignites the flame\nIn your eyes, I see my name",
                "[Chorus]\nTake my hand, let's fly away\nTo a place where love won't fade\nIn your arms, I find my home\nNever again will I be alone",
                "[Verse 2]\nRhythm of your breathing near\nWashes away all my fear\nGentle waves of sweet surrender\nLove's sweet song will never end",
                "[Bridge]\nThrough the highs and through the lows\nOur love forever grows\nIn this dance of hearts entwined\nForever you will be mine"
            },
            // Electronic/Dance theme
            {
                "[Verse 1]\nNeon lights flash in the crowd\nBass drops shaking the ground\nElectric pulses through my veins\nDancing in the summer rain",
                "[Chorus]\nFeel the beat inside your soul\nLet the rhythm take control\nMove your body to the sound\nIn this moment we're unbound",
                "[Verse 2]\nSynthesizers paint the sky\nDigital dreams flying high\nEvery wave crashes in time\nCreating worlds that intertwine",
                "[Bridge]\nWhen the music fades to black\nMemories we can't take back\nBut the rhythm lives inside\nForever we'll confide"
            }
        };

        // Select random theme
        String[] selectedTheme = themes[random.nextInt(themes.length)];

        StringBuilder lyrics = new StringBuilder();
        int numVerses = 2 + random.nextInt(2); // 2-3 verses

        // Add intro (sometimes)
        if (random.nextBoolean()) {
            lyrics.append("[Intro]\nOoh... yeah...\n");
        }

        // Add verses and choruses
        for (int i = 0; i < numVerses; i++) {
            if (i > 0) lyrics.append("\n\n");
            lyrics.append(selectedTheme[i % 3]); // Verse/Chorus rotation
            lyrics.append("\n\n");
            lyrics.append(selectedTheme[1]); // Chorus
        }

        // Add bridge (sometimes)
        if (random.nextBoolean()) {
            lyrics.append("\n\n");
            lyrics.append(selectedTheme[3]); // Bridge
            lyrics.append("\n\n");
            lyrics.append(selectedTheme[1]); // Final chorus
        }

        // Add outro
        lyrics.append("\n\n[Outro]\n");
        String[] outroLines = {"Fade out...", "Ooh... yeah...", "Until next time...", "Forever..."};
        for (int i = 0; i < 2 + random.nextInt(3); i++) {
            if (i > 0) lyrics.append("\n");
            lyrics.append(outroLines[random.nextInt(outroLines.length)]);
        }

        return lyrics.toString();
    }

    /**
     * Detect copyright infringement using audio fingerprinting
     * In production: integrate with ACRCloud, Audible Magic, or similar services
     */
    public boolean detectCopyright(String fileUrl) {
        // Simulate copyright detection - in production, call actual fingerprinting service
        return random.nextBoolean();
    }

    /**
     * Generate auto-synced lyrics with timestamps
     * In production: use forced alignment algorithms
     */
    public java.util.List<Song.LyricLine> generateSyncedLyrics(String fileUrl, String lyrics) {
        // Input validation
        if (fileUrl == null || fileUrl.trim().isEmpty()) {
            throw new IllegalArgumentException("File URL cannot be null or empty");
        }
        if (lyrics == null || lyrics.trim().isEmpty()) {
            throw new IllegalArgumentException("Lyrics cannot be null or empty");
        }

        // Check if AI Service is available for lyric synchronization
        if (aiServiceClient.isAvailable()) {
            try {
                log.info("Attempting to sync lyrics with AI Service for: {}", fileUrl);

                Map<String, Object> response = aiServiceClient.syncLyrics(fileUrl, lyrics);
                @SuppressWarnings("unchecked")
                java.util.List<java.util.Map<String, Object>> syncedData =
                    (java.util.List<java.util.Map<String, Object>>) response.get("synced_lyrics");

                if (syncedData != null && !syncedData.isEmpty()) {
                    java.util.List<Song.LyricLine> syncedLyrics = syncedData.stream()
                            .map(line -> {
                                try {
                                    return Song.LyricLine.builder()
                                            .timestamp(((Number) line.get("timestamp")).longValue())
                                            .text((String) line.get("text"))
                                            .build();
                                } catch (Exception e) {
                                    log.warn("Failed to parse lyric line: {}", line);
                                    return null;
                                }
                            })
                            .filter(line -> line != null && line.getText() != null && !line.getText().trim().isEmpty())
                            .collect(java.util.stream.Collectors.toList());

                    if (!syncedLyrics.isEmpty()) {
                        log.info("Successfully synced {} lyric lines from AI Service", syncedLyrics.size());
                        return syncedLyrics;
                    }
                }
                log.warn("AI Service returned empty or invalid synced lyrics");
            } catch (Exception e) {
                log.error("AI Service lyric sync failed for {}: {}", fileUrl, e.getMessage());
                // Continue to fallback instead of throwing
            }
        } else {
            log.warn("AI Service not available, using fallback lyric synchronization");
        }

        // Fallback to enhanced mock synchronization
        log.info("Using enhanced mock lyric synchronization for: {}", fileUrl);
        return generateEnhancedMockSyncedLyrics(lyrics);
    }

    /**
     * Generate enhanced mock synced lyrics with realistic timing
     */
    private java.util.List<Song.LyricLine> generateEnhancedMockSyncedLyrics(String lyrics) {
        java.util.List<Song.LyricLine> syncedLyrics = new java.util.ArrayList<>();
        String[] lines = lyrics.split("\n");
        long currentTime = 0;

        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;

            // Skip section headers like [Verse 1], [Chorus], etc.
            if (line.startsWith("[") && line.endsWith("]")) {
                continue;
            }

            // Skip non-lyric lines (intros, outros with "...")
            if (line.contains("...") && !line.contains(" ")) {
                continue;
            }

            syncedLyrics.add(Song.LyricLine.builder()
                    .timestamp(currentTime)
                    .text(line)
                    .build());

            // Calculate duration based on line content and musical timing
            int wordCount = line.split("\\s+").length;
            int charCount = line.length();

            // Different timing for different line types
            long baseDuration;
            if (line.toLowerCase().contains("yeah") || line.toLowerCase().contains("ooh")) {
                baseDuration = 1500 + random.nextInt(1000); // Ad-libs are shorter
            } else if (charCount < 30) {
                baseDuration = 2000 + random.nextInt(1500); // Short lines
            } else if (charCount > 60) {
                baseDuration = 4000 + random.nextInt(2000); // Long lines
            } else {
                baseDuration = 3000 + random.nextInt(1500); // Normal lines
            }

            // Add some natural variation
            long variation = (long) (baseDuration * 0.1 * (random.nextDouble() - 0.5)); // ±5% variation
            currentTime += Math.max(1500, baseDuration + variation);
        }

        // Ensure we have at least some synced lyrics
        if (syncedLyrics.isEmpty()) {
            syncedLyrics.add(Song.LyricLine.builder()
                    .timestamp(0L)
                    .text("Lyrics synchronization in progress...")
                    .build());
        }

        return syncedLyrics;
    }

    /**
     * Parse chord analysis data from AI service response
     */
    // ...existing code... (parseChordAnalysis implementation consolidated below)

    /**
     * Analyze chord progression for a song
     */
    public Song.ChordAnalysis analyzeSongChords(String fileUrl) {
        // Check if AI Service is available
        if (!aiServiceClient.isAvailable()) {
            log.warn("AI Service is not available, cannot analyze chords");
            throw new RuntimeException("AI Service is required for chord analysis");
        }

        try {
            log.info("Calling AI Service to analyze chords: {}", fileUrl);

            // Call AI Service for chord analysis
            Map<String, Object> response = aiServiceClient.analyzeChords(fileUrl);
            Map<String, Object> chordData = (Map<String, Object>) response.get("chord_analysis");

            if (chordData != null) {
                log.info("Chord analysis successful for song: {}", fileUrl);
                return parseChordAnalysis(chordData);
            } else {
                log.warn("AI Service returned empty chord analysis");
                throw new RuntimeException("Chord analysis failed: empty response");
            }

        } catch (Exception e) {
            log.error("Failed to analyze chords: {}", e.getMessage());
            throw new RuntimeException("Chord analysis failed: " + e.getMessage(), e);
        }
    }

    /**
     * Parse chord analysis data from AI service response
     */
    @SuppressWarnings("unchecked")
    private Song.ChordAnalysis parseChordAnalysis(Map<String, Object> chordData) {
        try {
            // Parse chord progression
            java.util.List<Song.ChordSegment> progression = new java.util.ArrayList<>();
            java.util.List<Map<String, Object>> progressionData = (java.util.List<Map<String, Object>>) chordData.get("progression");

            if (progressionData != null) {
                for (Map<String, Object> segment : progressionData) {
                    progression.add(Song.ChordSegment.builder()
                            .chord((String) segment.get("chord"))
                            .startTime(((Number) segment.get("start_time")).doubleValue())
                            .confidence(((Number) segment.get("confidence")).doubleValue())
                            .build());
                }
            }

            // Parse unique chords
            java.util.List<String> uniqueChords = (java.util.List<String>) chordData.get("unique_chords");
            if (uniqueChords == null) {
                uniqueChords = new java.util.ArrayList<>();
            }

            // Parse progression analysis
            Song.ProgressionAnalysis progressionAnalysis = null;
            Map<String, Object> progAnalysisData = (Map<String, Object>) chordData.get("progression_analysis");

            if (progAnalysisData != null) {
                progressionAnalysis = Song.ProgressionAnalysis.builder()
                        .chordFrequencies((java.util.Map<String, Integer>) progAnalysisData.get("chord_frequencies"))
                        .tonicChord((String) progAnalysisData.get("tonic_chord"))
                        .commonTransitions((java.util.Map<String, Integer>) progAnalysisData.get("common_transitions"))
                        .complexityScore(((Number) progAnalysisData.getOrDefault("complexity_score", 0.0)).doubleValue())
                        .progressionLength(((Number) progAnalysisData.getOrDefault("progression_length", 0)).intValue())
                        .build();
            }

            // Parse key compatibility
            Song.KeyCompatibility keyCompatibility = null;
            Map<String, Object> keyCompatData = (Map<String, Object>) chordData.get("key_compatibility");

            if (keyCompatData != null) {
                keyCompatibility = Song.KeyCompatibility.builder()
                        .bestMatchingKey((String) keyCompatData.get("best_matching_key"))
                        .compatibilityScore(((Number) keyCompatData.getOrDefault("compatibility_score", 0.0)).doubleValue())
                        .allCompatibilities((java.util.Map<String, Double>) keyCompatData.get("all_compatibilities"))
                        .build();
            }

            return Song.ChordAnalysis.builder()
                    .progression(progression)
                    .uniqueChords(uniqueChords)
                    .chordCount(((Number) chordData.getOrDefault("chord_count", 0)).intValue())
                    .averageConfidence(((Number) chordData.getOrDefault("average_confidence", 0.0)).doubleValue())
                    .progressionAnalysis(progressionAnalysis)
                    .keyCompatibility(keyCompatibility)
                    .build();

        } catch (Exception e) {
            log.error("Failed to parse chord analysis data: {}", e.getMessage());
            // Return minimal chord analysis on parse failure
            return Song.ChordAnalysis.builder()
                    .progression(new java.util.ArrayList<>())
                    .uniqueChords(new java.util.ArrayList<>())
                    .chordCount(0)
                    .averageConfidence(0.0)
                    .build();
        }
    }
}

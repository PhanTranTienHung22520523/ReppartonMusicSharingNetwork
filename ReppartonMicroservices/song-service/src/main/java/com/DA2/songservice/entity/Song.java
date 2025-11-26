package com.DA2.songservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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
    private Long duration;
    
    private Integer likesCount = 0;
    private Integer playsCount = 0;
    private Integer commentsCount = 0;
    private Integer sharesCount = 0;
    
    private List<String> genres;
    private String description;
    private boolean isPublic = true;
    private boolean isActive = true;
    
    private String lyrics;
    private List<LyricLine> syncedLyrics;
    private SongAnalysis aiAnalysis;

    // Constructors
    public Song() {
        this.likesCount = 0;
        this.playsCount = 0;
        this.commentsCount = 0;
        this.sharesCount = 0;
        this.isPublic = true;
        this.isActive = true;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getArtist() { return artist; }
    public void setArtist(String artist) { this.artist = artist; }
    
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    
    public String getCoverImageUrl() { return coverImageUrl; }
    public void setCoverImageUrl(String coverImageUrl) { this.coverImageUrl = coverImageUrl; }
    
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public Long getDuration() { return duration; }
    public void setDuration(Long duration) { this.duration = duration; }
    
    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }
    
    public Integer getPlaysCount() { return playsCount; }
    public void setPlaysCount(Integer playsCount) { this.playsCount = playsCount; }
    
    public Integer getCommentsCount() { return commentsCount; }
    public void setCommentsCount(Integer commentsCount) { this.commentsCount = commentsCount; }
    
    public Integer getSharesCount() { return sharesCount; }
    public void setSharesCount(Integer sharesCount) { this.sharesCount = sharesCount; }
    
    public List<String> getGenres() { return genres; }
    public void setGenres(List<String> genres) { this.genres = genres; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    
    public boolean isActive() { return isActive; }
    public void setActive(boolean isActive) { this.isActive = isActive; }
    
    public String getLyrics() { return lyrics; }
    public void setLyrics(String lyrics) { this.lyrics = lyrics; }
    
    public List<LyricLine> getSyncedLyrics() { return syncedLyrics; }
    public void setSyncedLyrics(List<LyricLine> syncedLyrics) { this.syncedLyrics = syncedLyrics; }
    
    public SongAnalysis getAiAnalysis() { return aiAnalysis; }
    public void setAiAnalysis(SongAnalysis aiAnalysis) { this.aiAnalysis = aiAnalysis; }

    // Inner classes
    public static class LyricLine {
        private Double timestamp;
        private String text;
        
        public LyricLine() {}
        
        public LyricLine(Double timestamp, String text) {
            this.timestamp = timestamp;
            this.text = text;
        }
        
        public Double getTimestamp() { return timestamp; }
        public void setTimestamp(Double timestamp) { this.timestamp = timestamp; }
        
        public String getText() { return text; }
        public void setText(String text) { this.text = text; }
        
        public static Builder builder() { return new Builder(); }
        
        public static class Builder {
            private Double timestamp;
            private String text;
            
            public Builder timestamp(Double timestamp) { this.timestamp = timestamp; return this; }
            public Builder text(String text) { this.text = text; return this; }
            public LyricLine build() { return new LyricLine(timestamp, text); }
        }
    }
    
    public static class SongAnalysis {
        private String key;
        private Double bpm;
        private String mood;
        private Double energy;
        private Double danceability;
        private LocalDateTime analyzedAt;
        private ChordAnalysis chordAnalysis;
        
        public SongAnalysis() {}
        
        public String getKey() { return key; }
        public void setKey(String key) { this.key = key; }
        
        public Double getBpm() { return bpm; }
        public void setBpm(Double bpm) { this.bpm = bpm; }
        
        public Double getTempo() { return bpm; }
        
        public String getMood() { return mood; }
        public void setMood(String mood) { this.mood = mood; }
        
        public Double getEnergy() { return energy; }
        public void setEnergy(Double energy) { this.energy = energy; }
        
        public Double getDanceability() { return danceability; }
        public void setDanceability(Double danceability) { this.danceability = danceability; }
        
        public LocalDateTime getAnalyzedAt() { return analyzedAt; }
        public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
        
        public ChordAnalysis getChordAnalysis() { return chordAnalysis; }
        public void setChordAnalysis(ChordAnalysis chordAnalysis) { this.chordAnalysis = chordAnalysis; }
        
        public static Builder builder() { return new Builder(); }
        
        public static class Builder {
            private String key;
            private Double bpm;
            private String mood;
            private Double energy;
            private Double danceability;
            private LocalDateTime analyzedAt;
            private ChordAnalysis chordAnalysis;
            
            public Builder key(String key) { this.key = key; return this; }
            public Builder bpm(Double bpm) { this.bpm = bpm; return this; }
            public Builder mood(String mood) { this.mood = mood; return this; }
            public Builder energy(Double energy) { this.energy = energy; return this; }
            public Builder danceability(Double danceability) { this.danceability = danceability; return this; }
            public Builder analyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; return this; }
            public Builder chordAnalysis(ChordAnalysis chordAnalysis) { this.chordAnalysis = chordAnalysis; return this; }
            
            public SongAnalysis build() {
                SongAnalysis analysis = new SongAnalysis();
                analysis.key = this.key;
                analysis.bpm = this.bpm;
                analysis.mood = this.mood;
                analysis.energy = this.energy;
                analysis.danceability = this.danceability;
                analysis.analyzedAt = this.analyzedAt;
                analysis.chordAnalysis = this.chordAnalysis;
                return analysis;
            }
        }
    }
    
    public static class ChordAnalysis {
        private List<Chord> chords;
        private LocalDateTime analyzedAt;
        
        public ChordAnalysis() {}
        
        public List<Chord> getChords() { return chords; }
        public void setChords(List<Chord> chords) { this.chords = chords; }
        
        public List<String> getUniqueChords() {
            if (chords == null) return new java.util.ArrayList<>();
            return chords.stream()
                .map(Chord::getChord)
                .distinct()
                .collect(java.util.stream.Collectors.toList());
        }
        
        public LocalDateTime getAnalyzedAt() { return analyzedAt; }
        public void setAnalyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; }
        
        public static Builder builder() { return new Builder(); }
        
        public static class Builder {
            private List<Chord> chords;
            private LocalDateTime analyzedAt;
            
            public Builder chords(List<Chord> chords) { this.chords = chords; return this; }
            public Builder analyzedAt(LocalDateTime analyzedAt) { this.analyzedAt = analyzedAt; return this; }
            
            public ChordAnalysis build() {
                ChordAnalysis analysis = new ChordAnalysis();
                analysis.chords = this.chords;
                analysis.analyzedAt = this.analyzedAt;
                return analysis;
            }
        }
    }
    
    public static class Chord {
        private Double timestamp;
        private String chord;
        private Double confidence;
        
        public Chord() {}
        
        public Double getTimestamp() { return timestamp; }
        public void setTimestamp(Double timestamp) { this.timestamp = timestamp; }
        
        public String getChord() { return chord; }
        public void setChord(String chord) { this.chord = chord; }
        
        public Double getConfidence() { return confidence; }
        public void setConfidence(Double confidence) { this.confidence = confidence; }
        
        public static Builder builder() { return new Builder(); }
        
        public static class Builder {
            private Double timestamp;
            private String chord;
            private Double confidence;
            
            public Builder timestamp(Double timestamp) { this.timestamp = timestamp; return this; }
            public Builder chord(String chord) { this.chord = chord; return this; }
            public Builder confidence(Double confidence) { this.confidence = confidence; return this; }
            
            public Chord build() {
                Chord c = new Chord();
                c.timestamp = this.timestamp;
                c.chord = this.chord;
                c.confidence = this.confidence;
                return c;
            }
        }
    }
}
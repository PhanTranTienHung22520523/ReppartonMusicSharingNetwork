package com.DA2.songservice.service;

import com.DA2.songservice.entity.Song;
import com.DA2.songservice.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {
    
    private final SongRepository songRepository;
    private final SongAIService songAIService;

    public List<Song> getAllPublicSongs() {
        return songRepository.findByIsPublicTrueAndIsActiveTrue();
    }

    public Song getSongById(String id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));
    }

    public List<Song> searchSongs(String query) {
        // Simple search by title or artist
        List<Song> titleResults = songRepository.findByTitleContainingIgnoreCase(query);
        List<Song> artistResults = songRepository.findByArtistContainingIgnoreCase(query);
        
        // Combine results (remove duplicates in real implementation)
        titleResults.addAll(artistResults);
        return titleResults;
    }

    public List<Song> getSongsByUser(String userId) {
        return songRepository.findByUploadedBy(userId);
    }

    public Song createSong(Song song) {
        song.setCreatedAt(LocalDateTime.now());
        song.setUpdatedAt(LocalDateTime.now());
        
        // AI Analysis: Analyze song when uploaded
        if (song.getFileUrl() != null && !song.getFileUrl().isEmpty()) {
            Song.SongAnalysis analysis = songAIService.analyzeSong(song.getFileUrl());
            song.setAiAnalysis(analysis);
        }
        
        return songRepository.save(song);
    }

    public Song updateSong(String id, Song songUpdate, String userId) {
        Song existingSong = getSongById(id);
        
        // Check if user owns the song
        if (!existingSong.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only update your own songs");
        }

        existingSong.setTitle(songUpdate.getTitle());
        existingSong.setArtist(songUpdate.getArtist());
        existingSong.setDescription(songUpdate.getDescription());
        existingSong.setGenres(songUpdate.getGenres());
        existingSong.setPublic(songUpdate.isPublic());
        existingSong.setUpdatedAt(LocalDateTime.now());

        return songRepository.save(existingSong);
    }

    public void deleteSong(String id, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only delete your own songs");
        }

        songRepository.deleteById(id);
    }

    public Song incrementPlayCount(String id) {
        Song song = getSongById(id);
        song.setPlaysCount(song.getPlaysCount() + 1);
        return songRepository.save(song);
    }

    public Song incrementLikeCount(String id) {
        Song song = getSongById(id);
        song.setLikesCount(song.getLikesCount() + 1);
        return songRepository.save(song);
    }

    public Song decrementLikeCount(String id) {
        Song song = getSongById(id);
        song.setLikesCount(Math.max(0, song.getLikesCount() - 1));
        return songRepository.save(song);
    }
    
    // ========== LYRIC MANAGEMENT ==========
    
    public Song updateLyrics(String id, String lyrics, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only update lyrics for your own songs");
        }
        
        song.setLyrics(lyrics);
        song.setUpdatedAt(LocalDateTime.now());
        
        // Generate synced lyrics using AI
        if (lyrics != null && !lyrics.isEmpty()) {
            List<Song.LyricLine> syncedLyrics = songAIService.generateSyncedLyrics(song.getFileUrl(), lyrics);
            song.setSyncedLyrics(syncedLyrics);
        }
        
        return songRepository.save(song);
    }
    
    public String getLyrics(String id) {
        Song song = getSongById(id);
        return song.getLyrics();
    }
    
    public List<Song.LyricLine> getSyncedLyrics(String id) {
        Song song = getSongById(id);
        return song.getSyncedLyrics();
    }
    
    public Song extractLyricsFromAudio(String id, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only extract lyrics for your own songs");
        }
        
        // Use AI to extract lyrics from audio
        String extractedLyrics = songAIService.extractLyrics(song.getFileUrl());
        song.setLyrics(extractedLyrics);
        
        // Generate synced lyrics
        List<Song.LyricLine> syncedLyrics = songAIService.generateSyncedLyrics(song.getFileUrl(), extractedLyrics);
        song.setSyncedLyrics(syncedLyrics);
        song.setUpdatedAt(LocalDateTime.now());
        
        return songRepository.save(song);
    }
    
    // ========== AI ANALYSIS ==========
    
    public Song analyzeWithAI(String id, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only analyze your own songs");
        }
        
        // Run AI analysis
        Song.SongAnalysis analysis = songAIService.analyzeSong(song.getFileUrl());
        song.setAiAnalysis(analysis);
        song.setUpdatedAt(LocalDateTime.now());
        
        return songRepository.save(song);
    }
    
    public Song.SongAnalysis getAIAnalysis(String id) {
        Song song = getSongById(id);
        return song.getAiAnalysis();
    }
    
    public List<Song> getSongsByKey(String key) {
        // Find songs with specific musical key
        return songRepository.findAll().stream()
                .filter(s -> s.getAiAnalysis() != null && key.equals(s.getAiAnalysis().getKey()))
                .toList();
    }
    
    public List<Song> getSongsByMood(String mood) {
        // Find songs with specific mood
        return songRepository.findAll().stream()
                .filter(s -> s.getAiAnalysis() != null && mood.equals(s.getAiAnalysis().getMood()))
                .toList();
    }
    
    public List<Song> getSongsByTempoRange(int minBpm, int maxBpm) {
        // Find songs within tempo range
        return songRepository.findAll().stream()
                .filter(s -> s.getAiAnalysis() != null 
                        && s.getAiAnalysis().getTempo() != null
                        && s.getAiAnalysis().getTempo() >= minBpm 
                        && s.getAiAnalysis().getTempo() <= maxBpm)
                .toList();
    }
}


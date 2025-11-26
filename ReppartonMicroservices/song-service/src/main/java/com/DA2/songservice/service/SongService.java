package com.DA2.songservice.service;

import com.DA2.songservice.entity.Song;
import com.DA2.songservice.repository.SongRepository;
import org.springframework.stereotype.Service;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import java.time.LocalDateTime;

@Service
public class SongService {
    
    private final SongRepository songRepository;
    private final SongAIService songAIService;
    
    public SongService(SongRepository songRepository, SongAIService songAIService) {
        this.songRepository = songRepository;
        this.songAIService = songAIService;
    }

    @Cacheable(value = "songs", key = "'public'")
    public List<Song> getAllPublicSongs() {
        return songRepository.findByIsPublicTrueAndIsActiveTrue();
    }

    @Cacheable(value = "songs", key = "'song:' + #id")
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

    public List<Song> searchLyrics(String query) {
        // Search songs by lyrics content
        return songRepository.findAll().stream()
                .filter(song -> song.getLyrics() != null
                        && song.getLyrics().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    public List<Song> getSongsByUser(String userId) {
        return songRepository.findByUploadedBy(userId);
    }

    public Song createSong(Song song) {
        song.setCreatedAt(LocalDateTime.now());
        song.setUpdatedAt(LocalDateTime.now());
        
        // AI Analysis
        if (song.getFileUrl() != null && !song.getFileUrl().isEmpty()) {
            Song.SongAnalysis analysis = songAIService.analyzeSong(song.getFileUrl());
            if (analysis != null) {
                song.setAiAnalysis(analysis);
            }
        }
        
        return songRepository.save(song);
    }

    @CacheEvict(value = "songs", key = "'song:' + #id")
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

    @Caching(evict = {
        @CacheEvict(value = "songs", key = "'song:' + #id"),
        @CacheEvict(value = "lyrics", key = "'lyrics:' + #id"),
        @CacheEvict(value = "lyrics", key = "'synced:' + #id")
    })
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
    
    @Caching(evict = {
        @CacheEvict(value = "lyrics", key = "'lyrics:' + #id"),
        @CacheEvict(value = "lyrics", key = "'synced:' + #id")
    })
    public Song updateLyrics(String id, String lyrics, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only update lyrics for your own songs");
        }
        
        song.setLyrics(lyrics);
        song.setUpdatedAt(LocalDateTime.now());
        
        // Generate synced lyrics
        if (lyrics != null && !lyrics.isEmpty()) {
            List<Song.LyricLine> syncedLyrics = songAIService.generateSyncedLyrics(song.getFileUrl(), lyrics);
            if (syncedLyrics != null && !syncedLyrics.isEmpty()) {
                song.setSyncedLyrics(syncedLyrics);
            }
        }
        
        return songRepository.save(song);
    }
    
    @Cacheable(value = "lyrics", key = "'lyrics:' + #id")
    public String getLyrics(String id) {
        Song song = getSongById(id);
        return song.getLyrics();
    }
    
    @Cacheable(value = "lyrics", key = "'synced:' + #id")
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
        
        // Extract lyrics using AI
        String extractedLyrics = songAIService.extractLyrics(song.getFileUrl());
        if (extractedLyrics != null) {
            song.setLyrics(extractedLyrics);
            List<Song.LyricLine> syncedLyrics = songAIService.generateSyncedLyrics(song.getFileUrl(), extractedLyrics);
            if (syncedLyrics != null && !syncedLyrics.isEmpty()) {
                song.setSyncedLyrics(syncedLyrics);
            }
        }
        song.setUpdatedAt(LocalDateTime.now());
        
        return songRepository.save(song);
    }
    
    public Song syncLyricsWithAudio(String id, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only sync lyrics for your own songs");
        }
        
        // Check if lyrics exist
        if (song.getLyrics() == null || song.getLyrics().trim().isEmpty()) {
            throw new RuntimeException("Lyrics must be set before syncing");
        }
        
        // Generate synced lyrics
        List<Song.LyricLine> syncedLyrics = songAIService.generateSyncedLyrics(song.getFileUrl(), song.getLyrics());
        if (syncedLyrics != null && !syncedLyrics.isEmpty()) {
            song.setSyncedLyrics(syncedLyrics);
        }
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
        if (analysis != null) {
            song.setAiAnalysis(analysis);
        }
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

    @Cacheable(value = "chords", key = "'chords:' + #id")
    public Song.ChordAnalysis getSongChords(String id) {
        Song song = getSongById(id);
        if (song.getAiAnalysis() == null || song.getAiAnalysis().getChordAnalysis() == null) {
            throw new RuntimeException("Chord analysis not available for this song");
        }
        return song.getAiAnalysis().getChordAnalysis();
    }

    @CacheEvict(value = "chords", key = "'chords:' + #id")
    public Song.ChordAnalysis analyzeSongChords(String id) {
        Song song = getSongById(id);
        if (song.getFileUrl() == null || song.getFileUrl().isEmpty()) {
            throw new RuntimeException("Song file URL is required for chord analysis");
        }

        // Analyze chords using AI
        Song.ChordAnalysis chordAnalysis = songAIService.analyzeSongChords(song.getFileUrl());

        // Update song with chord analysis
        if (chordAnalysis != null) {
            if (song.getAiAnalysis() == null) {
                song.setAiAnalysis(Song.SongAnalysis.builder()
                    .chordAnalysis(chordAnalysis)
                    .analyzedAt(java.time.LocalDateTime.now())
                    .build());
            } else {
                song.getAiAnalysis().setChordAnalysis(chordAnalysis);
                song.getAiAnalysis().setAnalyzedAt(java.time.LocalDateTime.now());
            }
        }

        songRepository.save(song);
        return chordAnalysis;
    }

    public List<Song> getSongsByChord(String chord) {
        // Find songs that contain specific chord in their progression
        return songRepository.findAll().stream()
                .filter(s -> s.getAiAnalysis() != null
                        && s.getAiAnalysis().getChordAnalysis() != null
                        && s.getAiAnalysis().getChordAnalysis().getUniqueChords() != null
                        && s.getAiAnalysis().getChordAnalysis().getUniqueChords().contains(chord))
                .toList();
    }
}


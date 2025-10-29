package com.DA2.songservice.controller;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.songservice.entity.Song;
import com.DA2.songservice.service.SongService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/songs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SongController {
    
    private final SongService songService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Song>>> getAllPublicSongs() {
        try {
            List<Song> songs = songService.getAllPublicSongs();
            return ResponseEntity.ok(ApiResponse.success("Songs retrieved successfully", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Song>> getSongById(@PathVariable String id) {
        try {
            Song song = songService.getSongById(id);
            return ResponseEntity.ok(ApiResponse.success("Song retrieved successfully", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Song>>> searchSongs(@RequestParam String query) {
        try {
            List<Song> songs = songService.searchSongs(query);
            return ResponseEntity.ok(ApiResponse.success("Search completed", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByUser(@PathVariable String userId) {
        try {
            List<Song> songs = songService.getSongsByUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User songs retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Song>> createSong(
            @RequestBody Song song,
            @RequestHeader("X-User-Id") String userId) {
        try {
            song.setUploadedBy(userId);
            Song createdSong = songService.createSong(song);
            return ResponseEntity.ok(ApiResponse.success("Song created successfully", createdSong));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Song>> updateSong(
            @PathVariable String id,
            @RequestBody Song song,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Song updatedSong = songService.updateSong(id, song, userId);
            return ResponseEntity.ok(ApiResponse.success("Song updated successfully", updatedSong));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSong(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        try {
            songService.deleteSong(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Song deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== LYRIC ENDPOINTS ==========
    
    @PutMapping("/{id}/lyrics")
    public ResponseEntity<ApiResponse<Song>> updateLyrics(
            @PathVariable String id,
            @RequestBody String lyrics,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Song song = songService.updateLyrics(id, lyrics, userId);
            return ResponseEntity.ok(ApiResponse.success("Lyrics updated successfully", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/lyrics")
    public ResponseEntity<ApiResponse<String>> getLyrics(@PathVariable String id) {
        try {
            String lyrics = songService.getLyrics(id);
            return ResponseEntity.ok(ApiResponse.success("Lyrics retrieved successfully", lyrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/lyrics/synced")
    public ResponseEntity<ApiResponse<List<Song.LyricLine>>> getSyncedLyrics(@PathVariable String id) {
        try {
            List<Song.LyricLine> syncedLyrics = songService.getSyncedLyrics(id);
            return ResponseEntity.ok(ApiResponse.success("Synced lyrics retrieved successfully", syncedLyrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/lyrics/extract")
    public ResponseEntity<ApiResponse<Song>> extractLyrics(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Song song = songService.extractLyricsFromAudio(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Lyrics extracted using AI", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== AI ANALYSIS ENDPOINTS ==========
    
    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<Song>> analyzeSongWithAI(
            @PathVariable String id,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Song song = songService.analyzeWithAI(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Song analyzed successfully", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/analysis")
    public ResponseEntity<ApiResponse<Song.SongAnalysis>> getAIAnalysis(@PathVariable String id) {
        try {
            Song.SongAnalysis analysis = songService.getAIAnalysis(id);
            return ResponseEntity.ok(ApiResponse.success("AI analysis retrieved", analysis));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-key/{key}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByKey(@PathVariable String key) {
        try {
            List<Song> songs = songService.getSongsByKey(key);
            return ResponseEntity.ok(ApiResponse.success("Songs by key retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-mood/{mood}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByMood(@PathVariable String mood) {
        try {
            List<Song> songs = songService.getSongsByMood(mood);
            return ResponseEntity.ok(ApiResponse.success("Songs by mood retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-tempo")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByTempo(
            @RequestParam int minBpm,
            @RequestParam int maxBpm) {
        try {
            List<Song> songs = songService.getSongsByTempoRange(minBpm, maxBpm);
            return ResponseEntity.ok(ApiResponse.success("Songs by tempo retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


package com.DA2.songservice.controller;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.songservice.entity.Song;
import com.DA2.songservice.dto.GenreCountDTO;
import com.DA2.songservice.service.SongService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/songs")
public class SongController {
    
    private final SongService songService;
    
    public SongController(SongService songService) {
        this.songService = songService;
    }

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof String) {
            return (String) authentication.getPrincipal();
        }
        throw new RuntimeException("User not authenticated");
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Song>>> getAllPublicSongs() {
        try {
            List<Song> songs = songService.getAllPublicSongs();
            return ResponseEntity.ok(ApiResponse.success("Songs retrieved successfully", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Public endpoint for newest releases
    // Return ApiResponse<List<Song>> to keep response shape consistent and avoid Page serialization issues.
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<List<Song>>> getPublicSongs(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {
        try {
            List<Song> songs = songService.getNewestSongs(page, size);
            return ResponseEntity.ok(ApiResponse.success("Newest songs retrieved successfully", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Most viewed / trending songs
    @GetMapping("/trending")
    public ResponseEntity<ApiResponse<List<Song>>> getTrendingSongs(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        try {
            List<Song> songs = songService.getTrendingSongs(Math.max(1, limit));
            return ResponseEntity.ok(ApiResponse.success("Trending songs retrieved successfully", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // Alias under /public so it also matches shared security allowlist (/api/*/public/**)
    @GetMapping("/public/trending")
    public ResponseEntity<ApiResponse<List<Song>>> getPublicTrendingSongs(
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return getTrendingSongs(limit);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Song>> getSongById(@PathVariable("id") String id) {
        try {
            Song song = songService.getSongById(id);
            return ResponseEntity.ok(ApiResponse.success("Song retrieved successfully", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<ApiResponse<Song>> recordPlay(@PathVariable("id") String id) {
        try {
            Song updated = songService.incrementPlayCount(id);
            return ResponseEntity.ok(ApiResponse.success("Play recorded successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Song>>> searchSongs(@RequestParam(name = "query") String query) {
        try {
            List<Song> songs = songService.searchSongs(query);
            return ResponseEntity.ok(ApiResponse.success("Search completed", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Song>> uploadSong(
            @RequestParam(name = "title") String title,
            @RequestParam(name = "description", required = false) String description,
            @RequestParam(name = "genres", required = false) List<String> genres,
            @RequestParam(name = "lyrics", required = false) String lyrics,
            @RequestParam(name = "audioFile") MultipartFile audioFile,
            @RequestParam(name = "coverFile", required = false) MultipartFile coverFile
    ) {
        try {
            String userId = getCurrentUserId();
            Song createdSong = songService.uploadSong(title, description, genres, lyrics, audioFile, coverFile, userId);
            return ResponseEntity.ok(ApiResponse.success("Song uploaded successfully", createdSong));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByGenre(@PathVariable("genre") String genre) {
        try {
            List<Song> songs = songService.getSongsByGenre(genre);
            return ResponseEntity.ok(ApiResponse.success("Genre songs retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/genres/counts")
    public ResponseEntity<ApiResponse<List<GenreCountDTO>>> getGenreCounts() {
        try {
            Map<String, Long> counts = songService.getGenreCounts();
            List<GenreCountDTO> result = new ArrayList<>();
            for (Map.Entry<String, Long> entry : counts.entrySet()) {
                result.add(new GenreCountDTO(entry.getKey(), entry.getValue()));
            }
            return ResponseEntity.ok(ApiResponse.success("Genre counts retrieved", result));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/search/lyrics")
    public ResponseEntity<ApiResponse<List<Song>>> searchLyrics(@RequestParam(name = "query") String query) {
        try {
            List<Song> songs = songService.searchLyrics(query);
            return ResponseEntity.ok(ApiResponse.success("Lyrics search completed", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByUser(@PathVariable("userId") String userId) {
        try {
            List<Song> songs = songService.getSongsByUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User songs retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Song>> createSong(@RequestBody Song song) {
        try {
            String userId = getCurrentUserId();
            song.setUploadedBy(userId);
            Song createdSong = songService.createSong(song);
            return ResponseEntity.ok(ApiResponse.success("Song created successfully", createdSong));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Song>> updateSong(
            @PathVariable("id") String id,
            @RequestBody Song song) {
        try {
            String userId = getCurrentUserId();
            Song updatedSong = songService.updateSong(id, song, userId);
            return ResponseEntity.ok(ApiResponse.success("Song updated successfully", updatedSong));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSong(@PathVariable("id") String id) {
        try {
            String userId = getCurrentUserId();
            songService.deleteSong(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Song deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== LYRIC ENDPOINTS ==========
    
    @PutMapping("/{id}/lyrics")
    public ResponseEntity<ApiResponse<Song>> updateLyrics(
            @PathVariable("id") String id,
            @RequestBody String lyrics) {
        try {
            String userId = getCurrentUserId();
            Song song = songService.updateLyrics(id, lyrics, userId);
            return ResponseEntity.ok(ApiResponse.success("Lyrics updated successfully", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/lyrics")
    public ResponseEntity<ApiResponse<String>> getLyrics(@PathVariable("id") String id) {
        try {
            String lyrics = songService.getLyrics(id);
            return ResponseEntity.ok(ApiResponse.success("Lyrics retrieved successfully", lyrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/lyrics/synced")
    public ResponseEntity<ApiResponse<List<Song.LyricLine>>> getSyncedLyrics(@PathVariable("id") String id) {
        try {
            List<Song.LyricLine> syncedLyrics = songService.getSyncedLyrics(id);
            return ResponseEntity.ok(ApiResponse.success("Synced lyrics retrieved successfully", syncedLyrics));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/lyrics/extract")
    public ResponseEntity<ApiResponse<Song>> extractLyrics(@PathVariable("id") String id) {
        try {
            String userId = getCurrentUserId();
            Song song = songService.extractLyricsFromAudio(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Lyrics extracted using AI", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/lyrics/sync")
    public ResponseEntity<ApiResponse<Song>> syncLyrics(
            @PathVariable("id") String id,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Song song = songService.syncLyricsWithAudio(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Lyrics synchronized with audio", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== AI ANALYSIS ENDPOINTS ==========
    
    @PostMapping("/{id}/analyze")
    public ResponseEntity<ApiResponse<Song>> analyzeSongWithAI(
            @PathVariable("id") String id,
            @RequestHeader("X-User-Id") String userId) {
        try {
            Song song = songService.analyzeWithAI(id, userId);
            return ResponseEntity.ok(ApiResponse.success("Song analyzed successfully", song));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/{id}/analysis")
    public ResponseEntity<ApiResponse<Song.SongAnalysis>> getAIAnalysis(@PathVariable("id") String id) {
        try {
            Song.SongAnalysis analysis = songService.getAIAnalysis(id);
            if (analysis == null) {
                // return an empty analysis object so frontend always gets the expected shape
                Song.SongAnalysis empty = Song.SongAnalysis.builder()
                        .bpm(null)
                        .key(null)
                        .mood(null)
                        .energy(null)
                        .danceability(null)
                        .analyzedAt(null)
                        .build();
                return ResponseEntity.ok(ApiResponse.success("AI analysis retrieved", empty));
            }
            return ResponseEntity.ok(ApiResponse.success("AI analysis retrieved", analysis));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-key/{key}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByKey(@PathVariable("key") String key) {
        try {
            List<Song> songs = songService.getSongsByKey(key);
            return ResponseEntity.ok(ApiResponse.success("Songs by key retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-mood/{mood}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByMood(@PathVariable("mood") String mood) {
        try {
            List<Song> songs = songService.getSongsByMood(mood);
            return ResponseEntity.ok(ApiResponse.success("Songs by mood retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/by-tempo")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByTempo(
            @RequestParam(name = "minBpm") int minBpm,
            @RequestParam(name = "maxBpm") int maxBpm) {
        try {
            List<Song> songs = songService.getSongsByTempoRange(minBpm, maxBpm);
            return ResponseEntity.ok(ApiResponse.success("Songs by tempo retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/chords")
    public ResponseEntity<ApiResponse<Song.ChordAnalysis>> getSongChords(@PathVariable("id") String id) {
        try {
            Song.ChordAnalysis chordAnalysis = songService.getSongChords(id);
            return ResponseEntity.ok(ApiResponse.success("Chord analysis retrieved", chordAnalysis));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/{id}/analyze-chords")
    public ResponseEntity<ApiResponse<Object>> analyzeSongChords(
            @PathVariable("id") String id,
            @RequestParam(name = "dominantOnly", required = false, defaultValue = "false") boolean dominantOnly
    ) {
        try {
            Song.ChordAnalysis chordAnalysis;
            if (dominantOnly) {
                chordAnalysis = songService.analyzeSongDominantLoop(id);
            } else {
                chordAnalysis = songService.analyzeSongChords(id);
            }

            if (chordAnalysis != null) {
                // ... (omitted for brevity, assume existing logic)
                // Ensure tempo/key are included in the returned payload when available
                Map<String, Object> result = Map.of(
                        "chordAnalysis", chordAnalysis,
                        "tempo", songService.getAIAnalysis(id) != null ? songService.getAIAnalysis(id).getBpm() : null,
                        "key", songService.getAIAnalysis(id) != null ? songService.getAIAnalysis(id).getKey() : null
                );
                return ResponseEntity.ok(ApiResponse.success("Chord analysis completed", (Object) result));
            }

            // parsed chordAnalysis was null — attempt to return raw AI response for debugging
            Map<String, Object> raw = songService.fetchRawChordAnalysis(id);
            if (raw != null) {
                 return ResponseEntity.ok(ApiResponse.success("Chord analysis raw data", (Object) raw));
            }
            
            return ResponseEntity.badRequest().body(ApiResponse.error("Analysis returned no data. Ensure AI service is running and file is accessible."));
            
        } catch (RuntimeException e) {
             // Explicitly catch the RuntimeException we threw in the service
             return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Analysis failed: " + e.getMessage()));
        }
    }

    @GetMapping("/by-chord/{chord}")
    public ResponseEntity<ApiResponse<List<Song>>> getSongsByChord(@PathVariable("chord") String chord) {
        try {
            List<Song> songs = songService.getSongsByChord(chord);
            return ResponseEntity.ok(ApiResponse.success("Songs by chord retrieved", songs));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


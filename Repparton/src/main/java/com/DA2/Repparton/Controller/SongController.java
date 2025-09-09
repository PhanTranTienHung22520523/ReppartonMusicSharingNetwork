package com.DA2.Repparton.Controller;

import com.DA2.Repparton.DTO.SongDTO;
import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Service.SongService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(origins = "*")
public class SongController {

    @Autowired
    private SongService songService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadSong(
            @RequestParam String title,
            @RequestParam String artistId,
            @RequestParam MultipartFile audioFile,
            @RequestParam(required = false) MultipartFile coverFile,
            @RequestParam(defaultValue = "false") boolean isPrivate,
            @RequestParam String genreIds,
            Authentication auth) {
        try {
            List<String> genreList = Arrays.asList(genreIds.split(","));
            Song song = songService.uploadSong(title, artistId, audioFile, coverFile, isPrivate, genreList);

            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Song uploaded successfully",
                "song", song
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getSongById(@PathVariable String id) {
        try {
            Optional<Song> song = songService.getSongById(id);
            if (song.isPresent()) {
                return ResponseEntity.ok(song.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getAllPublicSongs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Song> songs = songService.getAllPublicApprovedSongs(pageable);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getSongsByArtist(@PathVariable String artistId) {
        try {
            List<Song> songs = songService.getSongsByArtist(artistId);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchSongs(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Song> songs = songService.searchSongsByTitle(title, pageable);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/genre/{genreId}")
    public ResponseEntity<?> getSongsByGenre(
            @PathVariable String genreId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Song> songs = songService.getSongsByGenre(genreId, pageable);
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/recent/{userId}")
    public ResponseEntity<?> getRecentSongs(
            @PathVariable String userId,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "0") int page) {
        try {
            List<SongDTO> recentSongs = songService.getRecentSongsWithArtistInfo(userId, limit, page);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", recentSongs,
                "message", "Recent songs retrieved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error getting recent songs: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingSongs(@RequestParam(defaultValue = "10") int limit) {
        try {
            List<Song> trendingSongs = songService.getTrendingSongs(limit);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", trendingSongs,
                "message", "Trending songs retrieved successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error getting trending songs: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{id}/play")
    public ResponseEntity<?> playSong(@PathVariable String id, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            songService.incrementViews(id, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "View recorded"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approveSong(@PathVariable String id, Authentication auth) {
        try {
            Optional<Song> song = songService.approveSong(id);
            if (song.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Song approved successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to approve song"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectSong(@PathVariable String id, @RequestBody RejectRequest request, Authentication auth) {
        try {
            Optional<Song> song = songService.rejectSong(id, request.reason);
            if (song.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Song rejected successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to reject song"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<?> getPendingSongs(Authentication auth) {
        try {
            List<Song> songs = songService.getPendingSongs();
            return ResponseEntity.ok(songs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSong(@PathVariable String id, Authentication auth) {
        try {
            String userId = getCurrentUserId(auth);
            songService.deleteSong(id, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Song deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    private String getCurrentUserId(Authentication auth) {
        return "current-user-id";
    }

    public static class RejectRequest {
        public String reason;
    }
}

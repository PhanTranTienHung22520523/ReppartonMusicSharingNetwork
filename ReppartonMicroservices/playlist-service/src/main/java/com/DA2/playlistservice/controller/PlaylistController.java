package com.DA2.playlistservice.controller;

import com.DA2.playlistservice.entity.Playlist;
import com.DA2.playlistservice.entity.PlaylistFollower;
import com.DA2.playlistservice.service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
@CrossOrigin(origins = "*")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Playlist Service is running");
    }

    // Create playlist
    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody Playlist playlist) {
        try {
            Playlist created = playlistService.createPlaylist(playlist);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Playlist created successfully",
                "playlist", created
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Get playlist by ID
    @GetMapping("/{playlistId}")
    public ResponseEntity<?> getPlaylist(@PathVariable String playlistId) {
        try {
            Playlist playlist = playlistService.getPlaylistById(playlistId)
                    .orElseThrow(() -> new RuntimeException("Playlist not found"));
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Get user's playlists
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserPlaylists(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Playlist> playlists = playlistService.getPlaylistsByUser(userId, pageable);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get public playlists
    @GetMapping("/public")
    public ResponseEntity<?> getPublicPlaylists(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Playlist> playlists = playlistService.getPublicPlaylists(pageable);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update playlist
    @PutMapping("/{playlistId}")
    public ResponseEntity<?> updatePlaylist(
            @PathVariable String playlistId,
            @RequestParam String userId,
            @RequestBody Playlist updates) {
        try {
            Playlist updated = playlistService.updatePlaylist(playlistId, userId, updates);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Playlist updated successfully",
                "playlist", updated
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Delete playlist
    @DeleteMapping("/{playlistId}")
    public ResponseEntity<?> deletePlaylist(
            @PathVariable String playlistId,
            @RequestParam String userId) {
        try {
            playlistService.deletePlaylist(playlistId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Playlist deleted successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Add song to playlist
    @PostMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<?> addSong(
            @PathVariable String playlistId,
            @PathVariable String songId,
            @RequestParam String userId) {
        try {
            Playlist playlist = playlistService.addSongToPlaylist(playlistId, userId, songId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Song added to playlist",
                "playlist", playlist
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Remove song from playlist
    @DeleteMapping("/{playlistId}/songs/{songId}")
    public ResponseEntity<?> removeSong(
            @PathVariable String playlistId,
            @PathVariable String songId,
            @RequestParam String userId) {
        try {
            Playlist playlist = playlistService.removeSongFromPlaylist(playlistId, userId, songId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Song removed from playlist",
                "playlist", playlist
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Follow playlist
    @PostMapping("/{playlistId}/follow")
    public ResponseEntity<?> followPlaylist(
            @PathVariable String playlistId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            playlistService.followPlaylist(playlistId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Playlist followed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Unfollow playlist
    @DeleteMapping("/{playlistId}/follow")
    public ResponseEntity<?> unfollowPlaylist(
            @PathVariable String playlistId,
            @RequestParam String userId) {
        try {
            playlistService.unfollowPlaylist(playlistId, userId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Playlist unfollowed successfully"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", e.getMessage()
            ));
        }
    }

    // Check if following
    @GetMapping("/{playlistId}/following")
    public ResponseEntity<?> isFollowing(
            @PathVariable String playlistId,
            @RequestParam String userId) {
        try {
            boolean following = playlistService.isFollowing(playlistId, userId);
            return ResponseEntity.ok(Map.of("following", following));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get followed playlists
    @GetMapping("/followed/{userId}")
    public ResponseEntity<?> getFollowedPlaylists(@PathVariable String userId) {
        try {
            List<PlaylistFollower> followed = playlistService.getFollowedPlaylists(userId);
            return ResponseEntity.ok(followed);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Search playlists
    @GetMapping("/search")
    public ResponseEntity<?> searchPlaylists(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Playlist> playlists = playlistService.searchPlaylists(query, pageable);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get trending playlists
    @GetMapping("/trending")
    public ResponseEntity<?> getTrendingPlaylists() {
        try {
            List<Playlist> playlists = playlistService.getTrendingPlaylists();
            return ResponseEntity.ok(Map.of(
                "success", true,
                "playlists", playlists
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get playlists containing song
    @GetMapping("/song/{songId}")
    public ResponseEntity<?> getPlaylistsWithSong(@PathVariable String songId) {
        try {
            List<Playlist> playlists = playlistService.getPlaylistsContainingSong(songId);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

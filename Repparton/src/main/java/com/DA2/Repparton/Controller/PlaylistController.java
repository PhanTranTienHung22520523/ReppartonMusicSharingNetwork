package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Entity.Playlist;
import com.DA2.Repparton.DTO.PlaylistDTO;
import com.DA2.Repparton.Service.PlaylistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.List;

@RestController
@RequestMapping("/api/playlists")
public class PlaylistController {

    @Autowired
    private PlaylistService playlistService;

    @PostMapping("/create")
    public Playlist create(@RequestParam String name,
                           @RequestParam String userId,
                           @RequestParam(defaultValue = "true") boolean isPrivate) {
        return playlistService.createPlaylist(name, userId, isPrivate);
    }

    @GetMapping("/user/{userId}")
    public List<PlaylistDTO> getByUser(@PathVariable String userId) {
        return playlistService.getUserPlaylistDTOs(userId);
    }

    @PostMapping("/{playlistId}/songs")
    public ResponseEntity<?> addSong(@PathVariable String playlistId,
                                    @RequestBody AddSongRequest request,
                                    Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            Optional<Playlist> result = playlistService.addSong(playlistId, request.getSongId());
            if (result.isPresent()) {
                PlaylistDTO playlistDTO = playlistService.convertToDTO(result.get());
                return ResponseEntity.ok(playlistDTO);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{playlistId}/add")
    public Optional<Playlist> addSongLegacy(@PathVariable String playlistId,
                                           @RequestParam String songId) {
        return playlistService.addSong(playlistId, songId);
    }

    @PostMapping("/{playlistId}/remove")
    public Optional<Playlist> removeSong(@PathVariable String playlistId,
                                         @RequestParam String songId) {
        return playlistService.removeSong(playlistId, songId);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        playlistService.deletePlaylist(id);
    }
    
    // Get single playlist by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            Optional<PlaylistDTO> playlist = playlistService.getPlaylistDTOById(id);
            if (playlist.isPresent()) {
                return ResponseEntity.ok(playlist.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Get all public playlists
    @GetMapping("/public")
    public ResponseEntity<?> getPublicPlaylists() {
        try {
            List<Playlist> playlists = playlistService.getPublicPlaylists();
            List<PlaylistDTO> playlistDTOs = playlistService.convertToDTOs(playlists);
            return ResponseEntity.ok(playlistDTOs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Add authentication-aware endpoints
    @PostMapping("/create-auth")
    public ResponseEntity<?> createAuthenticated(@RequestParam String name,
                                                @RequestParam(defaultValue = "true") boolean isPrivate,
                                                Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = auth.getName();
            Playlist playlist = playlistService.createPlaylist(name, userId, isPrivate);
            return ResponseEntity.ok(playlist);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Add song with authentication
    @PostMapping("/{playlistId}/add-auth")
    public ResponseEntity<?> addSongAuthenticated(@PathVariable String playlistId,
                                                 @RequestParam String songId,
                                                 Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            Optional<Playlist> result = playlistService.addSong(playlistId, songId);
            if (result.isPresent()) {
                return ResponseEntity.ok(result.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // Get current user's playlists
    @GetMapping
    public ResponseEntity<?> getCurrentUserPlaylists(Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = auth.getName();
            List<PlaylistDTO> playlists = playlistService.getUserPlaylistDTOs(userId);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    // Create playlist with JSON body
    @PostMapping
    public ResponseEntity<?> createPlaylistJson(@RequestBody CreatePlaylistRequest request, 
                                               Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = auth.getName();
            Playlist playlist = playlistService.createPlaylist(
                request.getName(), 
                userId, 
                !request.isPublic() // Convert isPublic to isPrivate
            );
            // Return as DTO
            PlaylistDTO playlistDTO = playlistService.convertToDTO(playlist);
            return ResponseEntity.ok(playlistDTO);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
    
    // DTO for add song to playlist request
    public static class AddSongRequest {
        private String songId;
        
        public String getSongId() { return songId; }
        public void setSongId(String songId) { this.songId = songId; }
    }
    
    // DTO for create playlist request
    public static class CreatePlaylistRequest {
        private String name;
        private String description;
        private boolean isPublic;
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public boolean isPublic() { return isPublic; }
        public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    }
}

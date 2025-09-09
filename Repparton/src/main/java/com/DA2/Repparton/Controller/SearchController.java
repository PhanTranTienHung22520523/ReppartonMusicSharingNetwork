package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.SongService;
import com.DA2.Repparton.Service.UserService;
import com.DA2.Repparton.Service.PlaylistService;
import com.DA2.Repparton.Service.SearchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {

    @Autowired
    private SongService songService;
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private PlaylistService playlistService;
    
    @Autowired
    private SearchHistoryService searchHistoryService;

    // Global search endpoint
    @GetMapping
    public ResponseEntity<?> search(@RequestParam String query, 
                                   @RequestParam(defaultValue = "0") int page,
                                   @RequestParam(defaultValue = "10") int size,
                                   Authentication auth) {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // Search songs
            result.put("songs", songService.searchSongs(query, page, size));
            
            // Search users
            result.put("users", userService.searchUsers(query, page, size));
            
            // Search playlists
            result.put("playlists", playlistService.searchPlaylists(query, page, size));
            
            // Save search history if user is authenticated
            if (auth != null) {
                String userId = getCurrentUserId(auth);
                searchHistoryService.save(userId, query);
            }
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Search only songs
    @GetMapping("/songs")
    public ResponseEntity<?> searchSongs(@RequestParam String query,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        Authentication auth) {
        try {
            if (auth != null) {
                String userId = getCurrentUserId(auth);
                searchHistoryService.save(userId, query);
            }
            return ResponseEntity.ok(songService.searchSongs(query, page, size));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Search only users
    @GetMapping("/users")
    public ResponseEntity<?> searchUsers(@RequestParam String query,
                                        @RequestParam(defaultValue = "0") int page,
                                        @RequestParam(defaultValue = "10") int size,
                                        Authentication auth) {
        try {
            if (auth != null) {
                String userId = getCurrentUserId(auth);
                searchHistoryService.save(userId, query);
            }
            return ResponseEntity.ok(userService.searchUsers(query, page, size));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Search only playlists
    @GetMapping("/playlists")
    public ResponseEntity<?> searchPlaylists(@RequestParam String query,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size,
                                            Authentication auth) {
        try {
            if (auth != null) {
                String userId = getCurrentUserId(auth);
                searchHistoryService.save(userId, query);
            }
            return ResponseEntity.ok(playlistService.searchPlaylists(query, page, size));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get search suggestions
    @GetMapping("/suggestions")
    public ResponseEntity<?> getSearchSuggestions(@RequestParam String query) {
        try {
            Map<String, Object> suggestions = new HashMap<>();
            
            // Get top 5 matching songs, users, playlists
            suggestions.put("songs", songService.searchSongs(query, 0, 5));
            suggestions.put("users", userService.searchUsers(query, 0, 5));
            suggestions.put("playlists", playlistService.searchPlaylists(query, 0, 5));
            
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String getCurrentUserId(Authentication auth) {
        return auth.getName();
    }
}

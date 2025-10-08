package com.DA2.searchservice.service;

import com.DA2.searchservice.client.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
public class SearchService {

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private SongServiceClient songServiceClient;

    @Autowired
    private PlaylistServiceClient playlistServiceClient;

    @Autowired
    private PostServiceClient postServiceClient;

    // Global search across all services
    public Map<String, Object> globalSearch(String query, int page, int size) {
        Map<String, Object> results = new HashMap<>();

        try {
            // Search users
            CompletableFuture<Object> usersFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return userServiceClient.searchUsers(query, page, size);
                } catch (Exception e) {
                    return Map.of("error", "User service unavailable");
                }
            });

            // Search songs
            CompletableFuture<Object> songsFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return songServiceClient.searchSongs(query, page, size);
                } catch (Exception e) {
                    return Map.of("error", "Song service unavailable");
                }
            });

            // Search playlists
            CompletableFuture<Object> playlistsFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return playlistServiceClient.searchPlaylists(query, page, size);
                } catch (Exception e) {
                    return Map.of("error", "Playlist service unavailable");
                }
            });

            // Search posts
            CompletableFuture<Object> postsFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return postServiceClient.searchPosts(query, page, size);
                } catch (Exception e) {
                    return Map.of("error", "Post service unavailable");
                }
            });

            // Wait for all futures to complete
            CompletableFuture.allOf(usersFuture, songsFuture, playlistsFuture, postsFuture).join();

            // Collect results
            results.put("users", usersFuture.get());
            results.put("songs", songsFuture.get());
            results.put("playlists", playlistsFuture.get());
            results.put("posts", postsFuture.get());

        } catch (Exception e) {
            results.put("error", "Search failed: " + e.getMessage());
        }

        return results;
    }

    // Search only users
    public Object searchUsers(String query, int page, int size) {
        try {
            return userServiceClient.searchUsers(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("User search failed: " + e.getMessage());
        }
    }

    // Search only songs
    public Object searchSongs(String query, int page, int size) {
        try {
            return songServiceClient.searchSongs(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Song search failed: " + e.getMessage());
        }
    }

    // Search only playlists
    public Object searchPlaylists(String query, int page, int size) {
        try {
            return playlistServiceClient.searchPlaylists(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Playlist search failed: " + e.getMessage());
        }
    }

    // Search only posts
    public Object searchPosts(String query, int page, int size) {
        try {
            return postServiceClient.searchPosts(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Post search failed: " + e.getMessage());
        }
    }

    // Quick search - limited results for autocomplete
    public Map<String, Object> quickSearch(String query, int limit) {
        Map<String, Object> results = new HashMap<>();

        try {
            CompletableFuture<Object> usersFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return userServiceClient.searchUsers(query, 0, limit);
                } catch (Exception e) {
                    return Map.of();
                }
            });

            CompletableFuture<Object> songsFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return songServiceClient.searchSongs(query, 0, limit);
                } catch (Exception e) {
                    return Map.of();
                }
            });

            CompletableFuture.allOf(usersFuture, songsFuture).join();

            results.put("users", usersFuture.get());
            results.put("songs", songsFuture.get());

        } catch (Exception e) {
            results.put("error", "Quick search failed: " + e.getMessage());
        }

        return results;
    }
}

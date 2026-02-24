package com.DA2.searchservice.service;

import com.DA2.searchservice.client.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
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

    @Autowired(required = false)
    private AnalyticsServiceClient analyticsServiceClient;

    private void recordSearchBestEffort(String userId, String query) {
        try {
            if (analyticsServiceClient == null) return;
            if (userId == null || userId.isBlank()) return;
            if (query == null || query.trim().isEmpty()) return;

            // defensive: ensure query is not huge / has weird whitespace
            String normalizedQuery = query.trim();
            if (normalizedQuery.length() > 512) {
                normalizedQuery = normalizedQuery.substring(0, 512);
            }

            analyticsServiceClient.addSearchHistory(userId, normalizedQuery);
        } catch (Exception ignored) {
            // non-critical; do not fail search
        }
    }

    // Global search across all services
    public Map<String, Object> globalSearch(String query, String userId, int page, int size) {
        Map<String, Object> results = new HashMap<>();

        try {
            recordSearchBestEffort(userId, query);

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

            // Search lyrics
            CompletableFuture<Object> lyricsFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    return songServiceClient.searchLyrics(query, page, size);
                } catch (Exception e) {
                    return Map.of("error", "Lyrics search unavailable");
                }
            });

            // Wait for all futures to complete
            CompletableFuture.allOf(usersFuture, songsFuture, playlistsFuture, postsFuture, lyricsFuture).join();

            // Collect results
            results.put("users", usersFuture.get());
            results.put("songs", enrichSongsObject(songsFuture.get()));
            results.put("playlists", playlistsFuture.get());
            results.put("posts", postsFuture.get());
            results.put("lyrics", lyricsFuture.get());

        } catch (Exception e) {
            results.put("error", "Search failed: " + e.getMessage());
        }

        return results;
    }

    // Search only users
    public Object searchUsers(String query, String userId, int page, int size) {
        try {
            recordSearchBestEffort(userId, query);
            return userServiceClient.searchUsers(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("User search failed: " + e.getMessage());
        }
    }

    // Search only songs
    public Object searchSongs(String query, String userId, int page, int size) {
        try {
            recordSearchBestEffort(userId, query);
            Object raw = songServiceClient.searchSongs(query, page, size);
            return enrichSongsObject(raw);
        } catch (Exception e) {
            throw new RuntimeException("Song search failed: " + e.getMessage());
        }
    }

    // Search only playlists
    public Object searchPlaylists(String query, String userId, int page, int size) {
        try {
            recordSearchBestEffort(userId, query);
            return playlistServiceClient.searchPlaylists(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Playlist search failed: " + e.getMessage());
        }
    }

    // Search only posts
    public Object searchPosts(String query, String userId, int page, int size) {
        try {
            recordSearchBestEffort(userId, query);
            return postServiceClient.searchPosts(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Post search failed: " + e.getMessage());
        }
    }

    // Search lyrics within songs
    public Object searchLyrics(String query, String userId, int page, int size) {
        try {
            recordSearchBestEffort(userId, query);
            return songServiceClient.searchLyrics(query, page, size);
        } catch (Exception e) {
            throw new RuntimeException("Lyrics search failed: " + e.getMessage());
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
                    return enrichSongsObject(songServiceClient.searchSongs(query, 0, limit));
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

    private Object enrichSongsObject(Object raw) {
        try {
            if (raw == null) return null;

            // Most common: ApiResponse wrapper from song-service: { success, message, data: [..] }
            if (raw instanceof Map<?, ?> map) {
                Object data = map.get("data");
                if (data instanceof List<?> list) {
                    List<Map<String, Object>> enriched = enrichSongList(list);
                    Map<String, Object> copy = new LinkedHashMap<>();
                    for (Map.Entry<?, ?> e : map.entrySet()) {
                        copy.put(String.valueOf(e.getKey()), e.getValue());
                    }
                    copy.put("data", enriched);
                    return copy;
                }
            }

            // Raw list already
            if (raw instanceof List<?> list) {
                return enrichSongList(list);
            }

            return raw;
        } catch (Exception ignored) {
            return raw;
        }
    }

    private List<Map<String, Object>> enrichSongList(List<?> list) {
        List<Map<String, Object>> enriched = new ArrayList<>();
        if (list == null || list.isEmpty()) return enriched;

        // Cache per request to avoid N+1
        Map<String, Map<String, Object>> artistCache = new HashMap<>();

        for (Object item : list) {
            Map<String, Object> song = toStringKeyMap(item);
            if (song.isEmpty()) {
                continue;
            }

            String uploadedBy = firstNonBlank(
                    song.get("uploadedBy"),
                    song.get("artistId"),
                    song.get("userId"),
                    song.get("artist")
            );

            if (uploadedBy != null) {
                Map<String, Object> artist = artistCache.get(uploadedBy);
                if (artist == null) {
                    artist = fetchPublicUserAsArtist(uploadedBy);
                    artistCache.put(uploadedBy, artist);
                }

                if (artist != null && !artist.isEmpty()) {
                    song.putIfAbsent("artistUsername", artist.get("username"));
                    song.putIfAbsent("artistName", artist.get("name"));
                    song.putIfAbsent("artist", artist);
                }
            }

            enriched.add(song);
        }

        return enriched;
    }

    private Map<String, Object> fetchPublicUserAsArtist(String userIdOrUsername) {
        try {
            if (userIdOrUsername == null || userIdOrUsername.isBlank()) return Map.of();
            Object raw = userServiceClient.getPublicUserById(userIdOrUsername);
            if (!(raw instanceof Map<?, ?> map)) return Map.of();

            String username = map.get("username") == null ? null : String.valueOf(map.get("username"));
            String fullName = map.get("fullName") == null ? null : String.valueOf(map.get("fullName"));
            String name = (fullName != null && !fullName.isBlank()) ? fullName : username;

            Map<String, Object> artist = new LinkedHashMap<>();
            if (name != null) artist.put("name", name);
            if (username != null) artist.put("username", username);
            if (map.get("avatar") != null) artist.put("avatar", map.get("avatar"));
            if (map.get("id") != null) artist.put("id", map.get("id"));
            return artist;
        } catch (Exception ignored) {
            return Map.of();
        }
    }

    private Map<String, Object> toStringKeyMap(Object item) {
        if (item == null) return Map.of();
        if (item instanceof Map<?, ?> m) {
            Map<String, Object> out = new LinkedHashMap<>();
            for (Map.Entry<?, ?> e : m.entrySet()) {
                out.put(String.valueOf(e.getKey()), e.getValue());
            }
            return out;
        }
        return Map.of();
    }

    private String firstNonBlank(Object... values) {
        for (Object v : values) {
            if (v == null) continue;
            String s = String.valueOf(v).trim();
            if (!s.isEmpty() && !Objects.equals(s, "null")) return s;
        }
        return null;
    }
}

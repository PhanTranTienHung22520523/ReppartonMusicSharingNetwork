package com.DA2.songservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Cache Service for managing Redis cache operations
 * Provides centralized cache management for Song Service
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class CacheService {

    private final CacheManager cacheManager;

    // Cache names
    public static final String SONGS_CACHE = "songs";
    public static final String SEARCH_CACHE = "search";
    public static final String AI_CACHE = "ai";
    public static final String LYRICS_CACHE = "lyrics";

    /**
     * Get cache by name
     */
    private Cache getCache(String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache == null) {
            log.warn("Cache '{}' not found", cacheName);
        }
        return cache;
    }

    /**
     * Put object in cache
     */
    public void put(String cacheName, String key, Object value) {
        Cache cache = getCache(cacheName);
        if (cache != null) {
            cache.put(key, value);
            log.debug("Cached '{}' in cache '{}'", key, cacheName);
        }
    }

    /**
     * Get object from cache
     */
    @SuppressWarnings("unchecked")
    public <T> T get(String cacheName, String key, Class<T> type) {
        Cache cache = getCache(cacheName);
        if (cache != null) {
            Cache.ValueWrapper wrapper = cache.get(key);
            if (wrapper != null) {
                T value = (T) wrapper.get();
                log.debug("Retrieved '{}' from cache '{}'", key, cacheName);
                return value;
            }
        }
        return null;
    }

    /**
     * Remove object from cache
     */
    public void evict(String cacheName, String key) {
        Cache cache = getCache(cacheName);
        if (cache != null) {
            cache.evict(key);
            log.debug("Evicted '{}' from cache '{}'", key, cacheName);
        }
    }

    /**
     * Clear entire cache
     */
    public void clear(String cacheName) {
        Cache cache = getCache(cacheName);
        if (cache != null) {
            cache.clear();
            log.debug("Cleared cache '{}'", cacheName);
        }
    }

    /**
     * Check if key exists in cache
     */
    public boolean contains(String cacheName, String key) {
        Cache cache = getCache(cacheName);
        if (cache != null) {
            return cache.get(key) != null;
        }
        return false;
    }

    // ========== SONG CACHE METHODS ==========

    /**
     * Cache song data
     */
    public void cacheSong(String songId, Object song) {
        put(SONGS_CACHE, "song:" + songId, song);
    }

    /**
     * Get cached song
     */
    public <T> T getCachedSong(String songId, Class<T> type) {
        return get(SONGS_CACHE, "song:" + songId, type);
    }

    /**
     * Remove song from cache
     */
    public void evictSong(String songId) {
        evict(SONGS_CACHE, "song:" + songId);
    }

    // ========== SEARCH CACHE METHODS ==========

    /**
     * Cache search results
     */
    public void cacheSearchResults(String query, List<?> results) {
        put(SEARCH_CACHE, "search:" + query.toLowerCase(), results);
    }

    /**
     * Get cached search results
     */
    @SuppressWarnings("unchecked")
    public List<Object> getCachedSearchResults(String query) {
        return get(SEARCH_CACHE, "search:" + query.toLowerCase(), List.class);
    }

    // ========== AI CACHE METHODS ==========

    /**
     * Cache AI analysis results
     */
    public void cacheAIAnalysis(String songId, Object analysis) {
        put(AI_CACHE, "ai:" + songId, analysis);
    }

    /**
     * Get cached AI analysis
     */
    public <T> T getCachedAIAnalysis(String songId, Class<T> type) {
        return get(AI_CACHE, "ai:" + songId, type);
    }

    /**
     * Remove AI analysis from cache
     */
    public void evictAIAnalysis(String songId) {
        evict(AI_CACHE, "ai:" + songId);
    }

    // ========== LYRICS CACHE METHODS ==========

    /**
     * Cache lyrics
     */
    public void cacheLyrics(String songId, String lyrics) {
        put(LYRICS_CACHE, "lyrics:" + songId, lyrics);
    }

    /**
     * Get cached lyrics
     */
    public String getCachedLyrics(String songId) {
        return get(LYRICS_CACHE, "lyrics:" + songId, String.class);
    }

    /**
     * Cache synced lyrics
     */
    public void cacheSyncedLyrics(String songId, List<?> syncedLyrics) {
        put(LYRICS_CACHE, "synced:" + songId, syncedLyrics);
    }

    /**
     * Get cached synced lyrics
     */
    @SuppressWarnings("unchecked")
    public List<Object> getCachedSyncedLyrics(String songId) {
        return get(LYRICS_CACHE, "synced:" + songId, List.class);
    }

    /**
     * Remove lyrics from cache
     */
    public void evictLyrics(String songId) {
        evict(LYRICS_CACHE, "lyrics:" + songId);
        evict(LYRICS_CACHE, "synced:" + songId);
    }

    // ========== CACHE STATISTICS ==========

    /**
     * Get cache statistics (for monitoring)
     */
    public CacheStats getCacheStats(String cacheName) {
        Cache cache = getCache(cacheName);
        if (cache != null && cache.getNativeCache() instanceof org.springframework.data.redis.cache.RedisCache) {
            // In a real implementation, you would get stats from Redis
            // For now, return basic info
            return new CacheStats(cacheName, "Redis", true);
        }
        return new CacheStats(cacheName, "Unknown", false);
    }

    public static class CacheStats {
        public final String cacheName;
        public final String type;
        public final boolean available;

        public CacheStats(String cacheName, String type, boolean available) {
            this.cacheName = cacheName;
            this.type = type;
            this.available = available;
        }
    }
}
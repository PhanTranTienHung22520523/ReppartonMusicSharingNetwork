package com.DA2.songservice.service;

import com.DA2.songservice.entity.Song;
import com.DA2.songservice.repository.SongRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Comparator;
import java.util.ArrayList;
import java.util.Map;
import java.util.HashMap;
import java.time.LocalDateTime;

@Service
public class SongService {
    
    private static final Logger log = LoggerFactory.getLogger(SongService.class);
    private final SongRepository songRepository;
    private final SongAIService songAIService;

    private final RestTemplate restTemplate;

    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    @Value("${notification.service.url:http://localhost:8086/api/notifications}")
    private String notificationServiceUrl;

    @Value("${file.storage.service.url:http://localhost:8096}")
    private String fileStorageServiceUrl;
    
    public SongService(SongRepository songRepository, SongAIService songAIService, RestTemplate restTemplate) {
        this.songRepository = songRepository;
        this.songAIService = songAIService;
        this.restTemplate = restTemplate;
    }

    public Song uploadSong(
            String title,
            String description,
            List<String> genres,
            String lyrics,
            MultipartFile audioFile,
            MultipartFile coverFile,
            String userId
    ) {
        if (audioFile == null || audioFile.isEmpty()) {
            throw new RuntimeException("Audio file is required");
        }

        Map<String, Object> audioMeta = uploadAudioToFileStorage(audioFile);
        String audioUrl = audioMeta.get("url") == null ? null : String.valueOf(audioMeta.get("url"));
        Long durationSeconds = toLongSeconds(audioMeta.get("duration"));

        String coverUrl = null;
        if (coverFile != null && !coverFile.isEmpty()) {
            coverUrl = uploadToFileStorage(coverFile, "/api/files/upload/image");
        }

        Song song = new Song();
        song.setTitle(title);
        song.setDescription(description);
        song.setGenres(genres);
        song.setFileUrl(audioUrl);
        song.setCoverImageUrl(coverUrl);
        song.setUploadedBy(userId);
        song.setArtist(userId);
        if (durationSeconds != null && durationSeconds > 0) {
            song.setDuration(durationSeconds);
        }
        song.setCreatedAt(LocalDateTime.now());
        song.setUpdatedAt(LocalDateTime.now());

        if (lyrics != null && !lyrics.isBlank()) {
            song.setLyrics(lyrics);
            try {
                List<Song.LyricLine> syncedLyrics = songAIService.generateSyncedLyrics(audioUrl, lyrics);
                if (syncedLyrics != null && !syncedLyrics.isEmpty()) {
                    song.setSyncedLyrics(syncedLyrics);
                }
            } catch (Exception ignored) {
                // best-effort
            }
        }

        Song created = songRepository.save(song);

        // Run AI analysis asynchronously (Fire-and-forget)
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                if (created.getFileUrl() != null && !created.getFileUrl().isBlank()) {
                    System.out.println("Starting Async AI Analysis for song: " + created.getTitle());
                    try {
                        Song.SongAnalysis analysis = songAIService.analyzeSong(created.getFileUrl());
                        if (analysis != null) {
                            // attempt chord analysis as well
                            try {
                                Song.ChordAnalysis chordAnalysis = songAIService.analyzeSongChords(created.getFileUrl(), created.getId());
                                if (chordAnalysis != null) analysis.setChordAnalysis(chordAnalysis);
                            } catch (Exception ignoredChord) {
                                // best-effort: don't block upload on chord analysis failure
                            }

                            analysis.setAnalyzedAt(java.time.LocalDateTime.now());
                            
                            // Re-fetch song to avoid stale state if needed, or just save updates
                            Song s = songRepository.findById(created.getId()).orElse(created);
                            s.setAiAnalysis(analysis);
                            s.setUpdatedAt(java.time.LocalDateTime.now());
                            songRepository.save(s);
                            System.out.println("Async AI Analysis completed for song: " + s.getTitle());
                        }
                    } catch (Exception aiEx) {
                        System.err.println("AI analysis failed for uploaded song: " + aiEx.getMessage());
                    }
                }
            } catch (Exception e) {
                System.err.println("Async AI Error: " + e.getMessage());
            }
        });

        // Notify followers (best-effort) for public songs only
        try {
            if (created.isPublic() && created.isActive() && created.getUploadedBy() != null && !created.getUploadedBy().isBlank()) {
                notifyFollowersOfNewSong(created);
            }
        } catch (Exception ignored) {
            // best-effort
        }

        return created;
    }

    private Map<String, Object> uploadAudioToFileStorage(MultipartFile file) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(fileStorageServiceUrl + "/api/files/upload/audio", requestEntity, Map.class);

            Map<?, ?> resBody = response.getBody();
            if (resBody == null) {
                throw new RuntimeException("File upload failed: empty response");
            }

            Object url = resBody.get("url");
            if (url == null) {
                throw new RuntimeException("File upload failed: missing url");
            }

            Map<String, Object> meta = new HashMap<>();
            meta.put("url", String.valueOf(url));
            if (resBody.containsKey("duration")) {
                meta.put("duration", resBody.get("duration"));
            }
            return meta;
        } catch (Exception e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    private Long toLongSeconds(Object duration) {
        if (duration == null) return null;
        try {
            if (duration instanceof Number n) {
                double d = n.doubleValue();
                if (Double.isNaN(d) || Double.isInfinite(d)) return null;
                return Math.max(0L, (long) Math.floor(d));
            }
            String s = String.valueOf(duration).trim();
            if (s.isEmpty()) return null;
            double d = Double.parseDouble(s);
            if (Double.isNaN(d) || Double.isInfinite(d)) return null;
            return Math.max(0L, (long) Math.floor(d));
        } catch (Exception ignored) {
            return null;
        }
    }

    private void notifyFollowersOfNewSong(Song created) {
        try {
            List<String> followerIds = getFollowerIds(created.getUploadedBy());
            if (followerIds.isEmpty()) return;

            String songTitle = created.getTitle();
            if (songTitle != null) songTitle = songTitle.trim();

            int limit = Math.min(200, followerIds.size());
            for (int i = 0; i < limit; i++) {
                String followerId = followerIds.get(i);
                if (followerId == null || followerId.isBlank()) continue;
                if (followerId.equals(created.getUploadedBy())) continue;

                sendNotification(
                        followerId,
                        created.getUploadedBy(),
                        "new_music",
                        "New song",
                        "User " + created.getUploadedBy() + " released a new song" + (songTitle == null || songTitle.isBlank() ? "" : (": " + songTitle)),
                        created.getId()
                );
            }
        } catch (Exception ignored) {
            // best-effort
        }
    }

    private List<String> getFollowerIds(String userId) {
        List<String> ids = new ArrayList<>();
        try {
            Object res = restTemplate.getForObject(apiGatewayUrl + "/api/social/followers/" + userId, Object.class);
            if (!(res instanceof List<?> list)) return ids;
            for (Object item : list) {
                String id = extractUserId(item);
                if (id != null && !id.isBlank()) ids.add(id);
            }
        } catch (Exception ignored) {
            // best-effort
        }
        return ids;
    }

    private String extractUserId(Object item) {
        if (item == null) return null;
        if (item instanceof String s) return s;
        if (item instanceof Map<?, ?> map) {
            Object v = map.get("id");
            if (v == null) v = map.get("userId");
            if (v == null) v = map.get("_id");
            if (v == null) v = map.get("email");
            return v == null ? null : String.valueOf(v);
        }
        return null;
    }

    private void sendNotification(String recipientId, String actorId, String type, String title, String message, String referenceId) {
        try {
            if (recipientId == null || recipientId.isBlank()) return;
            Map<String, Object> body = new HashMap<>();
            body.put("userId", recipientId);
            body.put("actorId", actorId);
            body.put("type", type);
            body.put("title", title);
            body.put("message", message);
            body.put("referenceId", referenceId);
            restTemplate.postForObject(notificationServiceUrl, body, Object.class);
        } catch (Exception ignored) {
            // best-effort
        }
    }

    private String uploadToFileStorage(MultipartFile file, String endpointPath) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource resource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("file", resource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(fileStorageServiceUrl + endpointPath, requestEntity, Map.class);

            Map<?, ?> resBody = response.getBody();
            if (resBody == null) {
                throw new RuntimeException("File upload failed: empty response");
            }
            Object url = resBody.get("url");
            if (url == null) {
                throw new RuntimeException("File upload failed: missing url");
            }
            return String.valueOf(url);
        } catch (Exception e) {
            throw new RuntimeException("File upload failed: " + e.getMessage());
        }
    }

    @Cacheable(
        value = "songs",
        key = "'public:v2'",
        unless = "#result == null || #result.isEmpty()"
    )
    public List<Song> getAllPublicSongs() {
        try {
            // Legacy-friendly: include docs where isPublic/isActive are missing/null.
            List<Song> songs = songRepository.findPublicActiveOrLegacy();
            if (songs != null && !songs.isEmpty()) return songs;
        } catch (Exception ignored) {
            // Fall through to simpler strategies
        }

        // Fallbacks (should rarely be used)
        List<Song> songs = songRepository.findByIsPublicTrueAndIsActiveTrue();
        if (songs == null || songs.isEmpty()) {
            songs = songRepository.findAll();
        }
        return songs;
    }

    public Page<Song> getPublicSongs(Pageable pageable) {
        // Prefer filtering on public+active, but fallback to all for legacy records.
        try {
            Page<Song> page = songRepository.findPublicActiveOrLegacy(pageable);
            if (page != null && !page.isEmpty()) return page;
            return songRepository.findAll(pageable);
        } catch (Exception e) {
            // In case Mongo doesn't have the fields indexed/mapped as expected
            return songRepository.findAll(pageable);
        }
    }

    public List<Song> getNewestSongs(int page, int size) {
        List<Song> songs = getAllPublicSongs();
        if (songs == null || songs.isEmpty()) return List.of();

        List<Song> sorted = new ArrayList<>(songs);
        sorted.sort(Comparator.comparing(
                s -> s.getCreatedAt() == null ? LocalDateTime.MIN : s.getCreatedAt(),
                Comparator.reverseOrder()
        ));

        int safePage = Math.max(0, page);
        int safeSize = Math.max(1, size);
        int fromIndex = Math.min(safePage * safeSize, sorted.size());
        int toIndex = Math.min(fromIndex + safeSize, sorted.size());

        return sorted.subList(fromIndex, toIndex);
    }

    public List<Song> getTrendingSongs(int limit) {
        List<Song> songs = getAllPublicSongs();
        if (songs == null || songs.isEmpty()) return List.of();

        List<Song> sorted = new ArrayList<>(songs);
        sorted.sort(Comparator.comparing(
                s -> s.getPlaysCount() == null ? 0 : s.getPlaysCount(),
                Comparator.reverseOrder()
        ));
        return sorted.subList(0, Math.min(limit, sorted.size()));
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

    public List<Song> getSongsByGenre(String genre) {
        if (genre == null || genre.trim().isEmpty()) return List.of();
        String needle = genre.trim().toLowerCase();
        return getAllPublicSongs().stream()
                .filter(song -> song.getGenres() != null && song.getGenres().stream()
                        .filter(g -> g != null && !g.trim().isEmpty())
                        .map(g -> g.trim().toLowerCase())
                        .anyMatch(g -> g.contains(needle)))
                .toList();
    }

    public Map<String, Long> getGenreCounts() {
        Map<String, Long> counts = new HashMap<>();
        for (Song song : getAllPublicSongs()) {
            if (song == null || song.getGenres() == null) continue;
            for (String g : song.getGenres()) {
                if (g == null) continue;
                String key = g.trim().toLowerCase();
                if (key.isEmpty()) continue;
                counts.merge(key, 1L, Long::sum);
            }
        }
        return counts;
    }

    public Song createSong(Song song) {
        song.setCreatedAt(LocalDateTime.now());
        song.setUpdatedAt(LocalDateTime.now());
        
        Song created = songRepository.save(song);

        // AI Analysis (Async)
        if (created.getFileUrl() != null && !created.getFileUrl().isEmpty()) {
            java.util.concurrent.CompletableFuture.runAsync(() -> {
                try {
                    Song.SongAnalysis analysis = songAIService.analyzeSong(created.getFileUrl());
                    if (analysis != null) {
                        Song s = songRepository.findById(created.getId()).orElse(created);
                        s.setAiAnalysis(analysis);
                        songRepository.save(s);
                    }
                } catch (Exception e) {
                    System.err.println("Async createSong AI failed: " + e.getMessage());
                }
            });
        }

        // Notify followers (best-effort)
        if (created.getUploadedBy() != null && !created.getUploadedBy().isBlank()) {
            notifyFollowersOfNewSong(created);
        }

        return created;
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

    @Caching(evict = {
        @CacheEvict(value = "chords", key = "'chords:' + #id"),
        @CacheEvict(value = "songs", key = "'song:' + #id")
    })
    public Song.ChordAnalysis analyzeSongChords(String id) {
        Song song = getSongById(id);
        
        // 1. Return existing full progression if available
        if (song.getAiAnalysis() != null && song.getAiAnalysis().getChordAnalysis() != null) {
            List<Song.Chord> existingChords = song.getAiAnalysis().getChordAnalysis().getChords();
            if (existingChords != null && !existingChords.isEmpty()) {
                log.info("Returning existing chord analysis for songId={}", id);
                return song.getAiAnalysis().getChordAnalysis();
            }
        }

        if (song.getFileUrl() == null || song.getFileUrl().isEmpty()) {
            throw new RuntimeException("Song file URL is required for chord analysis");
        }

        // Analyze chords using AI (pass song id so AI can attach it)
        Song.ChordAnalysis chordAnalysis = songAIService.analyzeSongChords(song.getFileUrl(), id);

        // Update song with chord analysis
        if (chordAnalysis != null) {
            // Also attempt to fetch tempo/key from the AI general analysis and persist them
            try {
                Song.SongAnalysis general = songAIService.analyzeSong(song.getFileUrl());
                // also persist raw AI music analysis when available for debugging
                try {
                    Map<String, Object> raw = songAIService.analyzeMusicRaw(song.getFileUrl());
                    if (raw != null) song.setAiRaw(raw);
                } catch (Exception ignoredRaw) {}
                if (song.getAiAnalysis() == null) {
                    if (general != null) {
                        general.setChordAnalysis(chordAnalysis);
                        general.setAnalyzedAt(java.time.LocalDateTime.now());
                        song.setAiAnalysis(general);
                    } else {
                        Song.SongAnalysis sa = Song.SongAnalysis.builder()
                                .chordAnalysis(chordAnalysis)
                                .analyzedAt(java.time.LocalDateTime.now())
                                .build();
                        song.setAiAnalysis(sa);
                    }
                } else {
                    // merge fields
                    if (general != null) {
                            song.getAiAnalysis().setBpm(general.getBpm());
                            song.getAiAnalysis().setKey(general.getKey());
                            song.getAiAnalysis().setMood(general.getMood());
                            song.getAiAnalysis().setEnergy(general.getEnergy());
                            song.getAiAnalysis().setDanceability(general.getDanceability());
                        } else {
                            // fallback: try to obtain tempo/key from chord-analysis raw response
                            try {
                                Map<String, Object> rawChord = songAIService.analyzeChordsRaw(song.getFileUrl(), id);
                                if (rawChord != null) {
                                    // persist raw
                                    song.setAiRaw(rawChord);
                                    Double tempo = songAIService.getDoubleFromMap(rawChord, "tempo");
                                    String keyVal = songAIService.getStringFromMap(rawChord, "key");
                                    String moodVal = songAIService.getStringFromMap(rawChord, "mood");
                                    Double energyVal = songAIService.getDoubleFromMap(rawChord, "energy");
                                    Double danceVal = songAIService.getDoubleFromMap(rawChord, "danceability");
                                    if (tempo != null) song.getAiAnalysis().setBpm(tempo);
                                    if (keyVal != null) song.getAiAnalysis().setKey(keyVal);
                                    if (moodVal != null) song.getAiAnalysis().setMood(moodVal);
                                    if (energyVal != null) song.getAiAnalysis().setEnergy(energyVal);
                                    if (danceVal != null) song.getAiAnalysis().setDanceability(danceVal);
                                }
                            } catch (Exception ignoredRaw2) {
                                // swallow - best effort
                            }
                        }
                    song.getAiAnalysis().setChordAnalysis(chordAnalysis);
                    song.getAiAnalysis().setAnalyzedAt(java.time.LocalDateTime.now());
                }
            } catch (Exception ignored) {
                // best-effort: persist chord analysis even if general analysis fails
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
        }

        songRepository.save(song);
        return chordAnalysis;
    }

    /**
     * Analyze only dominant chord loop (compact). Persists resulting dominant loop and merges tempo/key when available.
     */
    @Caching(evict = {
            @CacheEvict(value = "chords", key = "'chords:' + #id"),
            @CacheEvict(value = "songs", key = "'song:' + #id")
    })
    public Song.ChordAnalysis analyzeSongDominantLoop(String id) {
        Song song = getSongById(id);

        // 1. Return existing dominant loop if available
        if (song.getAiAnalysis() != null && song.getAiAnalysis().getChordAnalysis() != null) {
            Map<String, Object> existingLoop = song.getAiAnalysis().getChordAnalysis().getDominantLoop();
            if (existingLoop != null && !existingLoop.isEmpty()) {
                log.info("Returning existing dominant loop for songId={}", id);
                return song.getAiAnalysis().getChordAnalysis();
            }
        }

        if (song.getFileUrl() == null || song.getFileUrl().isEmpty()) {
            throw new RuntimeException("Song file URL is required for chord analysis");
        }

        Song.ChordAnalysis chordAnalysis = songAIService.analyzeDominantLoop(song.getFileUrl(), id);

        if (chordAnalysis != null) {
            // Attempt to fetch tempo/key from general analysis and persist them (best-effort)
            try {
                Song.SongAnalysis general = songAIService.analyzeSong(song.getFileUrl());
                // persist raw AI music analysis when available
                try {
                    Map<String, Object> raw = songAIService.analyzeMusicRaw(song.getFileUrl());
                    if (raw != null) song.setAiRaw(raw);
                } catch (Exception ignoredRaw) {}
                if (song.getAiAnalysis() == null) {
                    if (general != null) {
                        general.setChordAnalysis(chordAnalysis);
                        general.setAnalyzedAt(java.time.LocalDateTime.now());
                        song.setAiAnalysis(general);
                    } else {
                        Song.SongAnalysis sa = Song.SongAnalysis.builder()
                                .chordAnalysis(chordAnalysis)
                                .analyzedAt(java.time.LocalDateTime.now())
                                .build();
                        song.setAiAnalysis(sa);
                    }
                } else {
                    if (general != null) {
                        song.getAiAnalysis().setBpm(general.getBpm());
                        song.getAiAnalysis().setKey(general.getKey());
                        song.getAiAnalysis().setMood(general.getMood());
                        song.getAiAnalysis().setEnergy(general.getEnergy());
                        song.getAiAnalysis().setDanceability(general.getDanceability());
                    }
                        else {
                            // fallback: try to read tempo/key from the chord-analysis raw response
                            try {
                                Map<String, Object> rawChord = songAIService.analyzeChordsRaw(song.getFileUrl(), id);
                                if (rawChord != null) {
                                    song.setAiRaw(rawChord);
                                    Double tempo = songAIService.getDoubleFromMap(rawChord, "tempo");
                                    String keyVal = songAIService.getStringFromMap(rawChord, "key");
                                    String moodVal = songAIService.getStringFromMap(rawChord, "mood");
                                    Double energyVal = songAIService.getDoubleFromMap(rawChord, "energy");
                                    Double danceVal = songAIService.getDoubleFromMap(rawChord, "danceability");
                                    if (tempo != null) song.getAiAnalysis().setBpm(tempo);
                                    if (keyVal != null) song.getAiAnalysis().setKey(keyVal);
                                    if (moodVal != null) song.getAiAnalysis().setMood(moodVal);
                                    if (energyVal != null) song.getAiAnalysis().setEnergy(energyVal);
                                    if (danceVal != null) song.getAiAnalysis().setDanceability(danceVal);
                                }
                            } catch (Exception ignored2) {}
                        }
                    song.getAiAnalysis().setChordAnalysis(chordAnalysis);
                    song.getAiAnalysis().setAnalyzedAt(java.time.LocalDateTime.now());
                }
            } catch (Exception ignored) {
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
        }

        songRepository.save(song);
        return chordAnalysis;
    }

    public Map<String, Object> fetchRawChordAnalysis(String id) {
        Song song = getSongById(id);
        if (song.getFileUrl() == null || song.getFileUrl().isEmpty()) {
            throw new RuntimeException("Song file URL is required for chord analysis");
        }
        Map<String, Object> raw = songAIService.analyzeChordsRaw(song.getFileUrl(), id);
        if (raw != null) {
            // persist raw AI response for later inspection
            song.setAiRaw(raw);
            // ensure aiAnalysis object exists so frontend sees analyzedAt when available
            if (song.getAiAnalysis() == null) {
                song.setAiAnalysis(Song.SongAnalysis.builder().analyzedAt(java.time.LocalDateTime.now()).build());
            }
            songRepository.save(song);
        }
        return raw;
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


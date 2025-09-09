package com.DA2.Repparton.Service;

import com.DA2.Repparton.DTO.SongDTO;
import com.DA2.Repparton.Entity.ListenHistory;
import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.ListenHistoryRepo;
import com.DA2.Repparton.Repository.SongRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SongService {

    @Autowired
    private SongRepo songRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private FollowService followService;

    @Autowired
    private ListenHistoryRepo listenHistoryRepo;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private UserRepo userRepository;

    @Transactional
    @CacheEvict(value = {"songs", "trending", "recommendations"}, allEntries = true)
    public Song uploadSong(String title,
                           String artistId,
                           MultipartFile audioFile,
                           MultipartFile coverFile,
                           boolean isPrivate,
                           List<String> genreIds) throws IOException {

        // Validate artist permissions
        User artist = userRepository.findById(artistId)
                .orElseThrow(() -> new RuntimeException("Artist not found"));

        if (!"artist".equals(artist.getRole()) && !"admin".equals(artist.getRole())) {
            throw new RuntimeException("User is not authorized to upload songs");
        }

        String audioUrl = null;
        String coverUrl = null;

        // Upload audio file (required)
        if (audioFile != null && !audioFile.isEmpty()) {
            // Validate audio file format
            if (!isValidAudioFormat(audioFile.getOriginalFilename())) {
                throw new RuntimeException("Invalid audio format. Supported: mp3, wav, flac");
            }
            audioUrl = cloudinaryService.uploadFile(audioFile);
        } else {
            throw new RuntimeException("Audio file is required");
        }

        // Upload cover image (optional)
        if (coverFile != null && !coverFile.isEmpty()) {
            if (!isValidImageFormat(coverFile.getOriginalFilename())) {
                throw new RuntimeException("Invalid image format. Supported: jpg, jpeg, png");
            }
            coverUrl = cloudinaryService.uploadFile(coverFile);
        }

        // Sử dụng constructor thay vì builder
        Song song = new Song(title, artistId);
        song.setAudioUrl(audioUrl);
        song.setCoverUrl(coverUrl);
        song.setPrivate(isPrivate);
        song.setStatus("pending");
        song.setViews(0);
        song.setLikes(0);
        song.setShares(0);
        song.setGenreIds(genreIds);
        song.setCreatedAt(LocalDateTime.now());

        Song savedSong = songRepository.save(song);

        // Notify followers if song is public
        if (!isPrivate) {
            notifyFollowersAboutNewSong(artistId, savedSong);
        }

        System.out.println("Song uploaded successfully: " + title + " by artist: " + artistId);
        return savedSong;
    }

    @Cacheable(value = "songs", key = "#id")
    public Optional<Song> getSongById(String id) {
        return songRepository.findById(id);
    }

    // Get multiple songs by their IDs
    public List<Song> getSongsByIds(List<String> songIds) {
        if (songIds == null || songIds.isEmpty()) {
            return List.of();
        }
        return songRepository.findByIdIn(songIds);
    }

    @Cacheable(value = "songs", key = "'public-approved'")
    public Page<Song> getAllPublicApprovedSongs(Pageable pageable) {
        return songRepository.findByIsPrivateFalseAndStatus("approved", pageable);
    }

    @Cacheable(value = "songs", key = "'artist-' + #artistId")
    public List<Song> getSongsByArtist(String artistId) {
        return songRepository.findByArtistIdOrderByCreatedAtDesc(artistId);
    }

    public Page<Song> searchSongsByTitle(String title, Pageable pageable) {
        return songRepository.findByTitleContainingIgnoreCaseAndIsPrivateFalseAndStatus(
                title, "approved", pageable);
    }

    @Cacheable(value = "songs", key = "'genre-' + #genreId")
    public Page<Song> getSongsByGenre(String genreId, Pageable pageable) {
        return songRepository.findByGenreIdsContainingAndIsPrivateFalseAndStatus(
                genreId, "approved", pageable);
    }

    @Cacheable(value = "trending", key = "'trending-songs'")
    public List<Song> getTrendingSongs(int limit) {
        Pageable pageable = PageRequest.of(0, limit, Sort.by("views").descending());
        return songRepository.findByIsPrivateFalseAndStatusOrderByViewsDesc("approved", pageable);
    }

    @Cacheable(value = "recommendations", key = "#userId")
    public List<Song> getRecommendedSongs(String userId, int limit) {
        // Get user's listening history
        List<ListenHistory> history = listenHistoryRepo.findByUserIdOrderByCreatedAtDesc(userId);

        if (history.isEmpty()) {
            // Return trending songs for new users
            return getTrendingSongs(limit);
        }

        // Get genres from user's listening history
        List<String> userGenres = history.stream()
                .map(ListenHistory::getSongId)
                .map(songId -> songRepository.findById(songId))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .flatMap(song -> song.getGenreIds().stream())
                .distinct()
                .collect(Collectors.toList());

        // Get recommended songs based on genres
        Pageable pageable = PageRequest.of(0, limit);
        return songRepository.findRecommendedSongs(userGenres, userId, pageable);
    }

    // Get recent songs based on user's listen history
    public List<Song> getRecentSongs(String userId, int limit) {
        return getRecentSongs(userId, limit, 0);
    }
    
    // Get recent songs with pagination support
    public List<Song> getRecentSongs(String userId, int limit, int page) {
        try {
            // Get recent listen history for user, ordered by most recent first
            List<ListenHistory> recentHistory = listenHistoryRepo.findByUserIdOrderByCreatedAtDesc(userId);
            
            if (recentHistory.isEmpty()) {
                // If no history, return some popular songs as fallback
                return getTrendingSongs(limit);
            }
            
            // Get unique song IDs from history (to avoid duplicates)
            List<String> uniqueSongIds = recentHistory.stream()
                .map(ListenHistory::getSongId)
                .distinct() // Remove duplicates
                .collect(Collectors.toList());
            
            // Apply pagination
            int startIndex = page * limit;
            int endIndex = Math.min(startIndex + limit, uniqueSongIds.size());
            
            if (startIndex >= uniqueSongIds.size()) {
                return List.of(); // Return empty list if page is out of bounds
            }
            
            List<String> pagedSongIds = uniqueSongIds.subList(startIndex, endIndex);
            
            // Fetch songs by IDs and maintain the order
            return pagedSongIds.stream()
                .map(songId -> songRepository.findById(songId))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            System.out.println("Error getting recent songs for user " + userId + ": " + e.getMessage());
            // Fallback to trending songs if there's an error
            return getTrendingSongs(limit);
        }
    }

    // Get recent songs with artist information as DTOs
    public List<SongDTO> getRecentSongsWithArtistInfo(String userId, int limit, int page) {
        try {
            // Get recent listen history for user, ordered by most recent first
            List<ListenHistory> recentHistory = listenHistoryRepo.findByUserIdOrderByCreatedAtDesc(userId);
            
            if (recentHistory.isEmpty()) {
                // If no history, return some popular songs as fallback
                return getTrendingSongsWithArtistInfo(limit);
            }
            
            // Get unique song IDs from history (to avoid duplicates)
            List<String> uniqueSongIds = recentHistory.stream()
                .map(ListenHistory::getSongId)
                .distinct() // Remove duplicates
                .collect(Collectors.toList());
            
            // Apply pagination
            int startIndex = page * limit;
            int endIndex = Math.min(startIndex + limit, uniqueSongIds.size());
            
            if (startIndex >= uniqueSongIds.size()) {
                return List.of(); // Return empty list if page is out of bounds
            }
            
            List<String> pagedSongIds = uniqueSongIds.subList(startIndex, endIndex);
            
            // Fetch songs by IDs and enrich with artist information
            return pagedSongIds.stream()
                .map(songId -> songRepository.findById(songId))
                .filter(Optional::isPresent)
                .map(Optional::get)
                .map(song -> {
                    User artist = userRepository.findById(song.getArtistId()).orElse(null);
                    return SongDTO.fromSongAndArtist(song, artist);
                })
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            System.out.println("Error getting recent songs with artist info for user " + userId + ": " + e.getMessage());
            // Fallback to trending songs if there's an error
            return getTrendingSongsWithArtistInfo(limit);
        }
    }

    // Helper method to get trending songs with artist info
    private List<SongDTO> getTrendingSongsWithArtistInfo(int limit) {
        try {
            List<Song> trendingSongs = getTrendingSongs(limit);
            return trendingSongs.stream()
                .map(song -> {
                    User artist = userRepository.findById(song.getArtistId()).orElse(null);
                    return SongDTO.fromSongAndArtist(song, artist);
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            System.out.println("Error getting trending songs with artist info: " + e.getMessage());
            return List.of();
        }
    }

    @Transactional
    public void incrementViews(String songId, String userId) {
        Optional<Song> songOpt = songRepository.findById(songId);
        if (songOpt.isPresent()) {
            Song song = songOpt.get();
            song.setViews(song.getViews() + 1);
            songRepository.save(song);

            // Record listening history
            recordListeningHistory(userId, songId);

            System.out.println("Views incremented for song: " + songId);
        }
    }

    @Transactional
    @CacheEvict(value = {"songs", "trending"}, allEntries = true)
    public Optional<Song> approveSong(String songId) {
        Optional<Song> songOpt = songRepository.findById(songId);

        if (songOpt.isEmpty()) return Optional.empty();

        Song song = songOpt.get();
        if (!"pending".equals(song.getStatus())) {
            return Optional.empty();
        }

        song.setStatus("approved");
        Song savedSong = songRepository.save(song);

        // Notify artist about approval
        notificationService.sendNotification(
                song.getArtistId(),
                "Your song '" + song.getTitle() + "' has been approved!",
                "SONG_APPROVED",
                songId
        );

        System.out.println("Song approved: " + songId);
        return Optional.of(savedSong);
    }

    @Transactional
    @CacheEvict(value = {"songs", "trending", "recommendations"}, allEntries = true)
    public Optional<Song> rejectSong(String songId, String reason) {
        Optional<Song> songOpt = songRepository.findById(songId);

        if (songOpt.isEmpty()) return Optional.empty();

        Song song = songOpt.get();
        song.setStatus("rejected");
        Song savedSong = songRepository.save(song);

        // Notify artist about rejection
        notificationService.sendNotification(
                song.getArtistId(),
                "Your song '" + song.getTitle() + "' was rejected. Reason: " + reason,
                "SONG_REJECTED",
                songId
        );

        System.out.println("Song rejected: " + songId + " with reason: " + reason);
        return Optional.of(savedSong);
    }

    public List<Song> getPendingSongs() {
        return songRepository.findByStatusOrderByCreatedAtAsc("pending");
    }

    @Transactional
    public void deleteSong(String songId, String userId) {
        Optional<Song> songOpt = songRepository.findById(songId);

        if (songOpt.isPresent()) {
            Song song = songOpt.get();

            // Check if user owns the song or is admin
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!song.getArtistId().equals(userId) && !"admin".equals(user.getRole())) {
                throw new RuntimeException("Unauthorized to delete this song");
            }

            songRepository.deleteById(songId);
            System.out.println("Song deleted: " + songId + " by user: " + userId);
        }
    }

    // Enhanced search method
    public Page<Song> searchSongs(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return songRepository.findByTitleContainingIgnoreCaseAndIsPrivateFalseAndStatus(
                query, "approved", pageable);
    }

    // Search songs by multiple criteria
    public Page<Song> searchSongsAdvanced(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Search by title using the new method
        return songRepository.findByTitleSearchAndIsPrivateFalseAndStatus(
                query, "approved", pageable);
    }

    private void notifyFollowersAboutNewSong(String artistId, Song song) {
        try {
            // Sử dụng method có sẵn trong FollowService
            List<User> followers = followService.getFollowers(artistId);
            User artist = userRepository.findById(artistId).orElse(null);
            String artistName = artist != null ? artist.getUsername() : "Unknown Artist";

            for (User follower : followers) {
                String message = artistName + " just released a new song: " + song.getTitle();
                notificationService.sendNotification(
                        follower.getId(),
                        message,
                        "NEW_SONG",
                        song.getId()
                );
            }
        } catch (Exception e) {
            System.out.println("Failed to notify followers about new song: " + song.getId() + " - " + e.getMessage());
        }
    }

    private void recordListeningHistory(String userId, String songId) {
        try {
            // Sử dụng constructor thay vì builder
            ListenHistory history = new ListenHistory(userId, songId);

            listenHistoryRepo.save(history);
        } catch (Exception e) {
            System.out.println("Failed to record listening history for user: " + userId + " song: " + songId + " - " + e.getMessage());
        }
    }

    private boolean isValidAudioFormat(String filename) {
        if (filename == null) return false;
        String extension = filename.toLowerCase();
        return extension.endsWith(".mp3") || extension.endsWith(".wav") || extension.endsWith(".flac");
    }

    private boolean isValidImageFormat(String filename) {
        if (filename == null) return false;
        String extension = filename.toLowerCase();
        return extension.endsWith(".jpg") || extension.endsWith(".jpeg") || extension.endsWith(".png");
    }
}

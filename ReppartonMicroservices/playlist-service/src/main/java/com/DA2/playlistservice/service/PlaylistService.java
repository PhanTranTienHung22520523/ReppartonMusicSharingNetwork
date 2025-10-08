package com.DA2.playlistservice.service;

import com.DA2.playlistservice.entity.Playlist;
import com.DA2.playlistservice.entity.PlaylistFollower;
import com.DA2.playlistservice.repository.PlaylistRepository;
import com.DA2.playlistservice.repository.PlaylistFollowerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepository playlistRepository;

    @Autowired
    private PlaylistFollowerRepository playlistFollowerRepository;

    // Create playlist
    @Transactional
    public Playlist createPlaylist(Playlist playlist) {
        if (playlist.getName() == null || playlist.getName().trim().isEmpty()) {
            throw new RuntimeException("Playlist name is required");
        }
        playlist.setCreatedAt(LocalDateTime.now());
        return playlistRepository.save(playlist);
    }

    // Get playlist by ID
    public Optional<Playlist> getPlaylistById(String playlistId) {
        return playlistRepository.findById(playlistId);
    }

    // Get playlists by user
    public List<Playlist> getPlaylistsByUser(String userId) {
        return playlistRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Page<Playlist> getPlaylistsByUser(String userId, Pageable pageable) {
        return playlistRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    // Get public playlists
    public Page<Playlist> getPublicPlaylists(Pageable pageable) {
        return playlistRepository.findByIsPrivateFalseOrderByCreatedAtDesc(pageable);
    }

    // Update playlist
    @Transactional
    public Playlist updatePlaylist(String playlistId, String userId, Playlist updates) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this playlist");
        }

        if (updates.getName() != null) {
            playlist.setName(updates.getName());
        }
        if (updates.getDescription() != null) {
            playlist.setDescription(updates.getDescription());
        }
        if (updates.getCoverUrl() != null) {
            playlist.setCoverUrl(updates.getCoverUrl());
        }
        
        playlist.setUpdatedAt(LocalDateTime.now());
        return playlistRepository.save(playlist);
    }

    // Delete playlist
    @Transactional
    public void deletePlaylist(String playlistId, String userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this playlist");
        }

        playlistRepository.deleteById(playlistId);
        // Clean up followers
        List<PlaylistFollower> followers = playlistFollowerRepository.findByPlaylistId(playlistId);
        playlistFollowerRepository.deleteAll(followers);
    }

    // Add song to playlist
    @Transactional
    public Playlist addSongToPlaylist(String playlistId, String userId, String songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this playlist");
        }

        playlist.addSong(songId);
        return playlistRepository.save(playlist);
    }

    // Remove song from playlist
    @Transactional
    public Playlist removeSongFromPlaylist(String playlistId, String userId, String songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        if (!playlist.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to modify this playlist");
        }

        playlist.removeSong(songId);
        return playlistRepository.save(playlist);
    }

    // Follow playlist
    @Transactional
    public void followPlaylist(String playlistId, String userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        Optional<PlaylistFollower> existing = playlistFollowerRepository.findByPlaylistIdAndUserId(playlistId, userId);
        if (existing.isPresent()) {
            throw new RuntimeException("Already following this playlist");
        }

        PlaylistFollower follower = new PlaylistFollower(playlistId, userId);
        playlistFollowerRepository.save(follower);

        playlist.incrementFollowers();
        playlistRepository.save(playlist);
    }

    // Unfollow playlist
    @Transactional
    public void unfollowPlaylist(String playlistId, String userId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));

        PlaylistFollower follower = playlistFollowerRepository.findByPlaylistIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new RuntimeException("Not following this playlist"));

        playlistFollowerRepository.delete(follower);

        playlist.decrementFollowers();
        playlistRepository.save(playlist);
    }

    // Check if user follows playlist
    public boolean isFollowing(String playlistId, String userId) {
        return playlistFollowerRepository.findByPlaylistIdAndUserId(playlistId, userId).isPresent();
    }

    // Get followed playlists
    public List<PlaylistFollower> getFollowedPlaylists(String userId) {
        return playlistFollowerRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Search playlists
    public Page<Playlist> searchPlaylists(String query, Pageable pageable) {
        return playlistRepository.searchByName(query, pageable);
    }

    // Get trending playlists
    public List<Playlist> getTrendingPlaylists() {
        return playlistRepository.findTop10ByOrderByFollowersDesc();
    }

    // Get playlists containing song
    public List<Playlist> getPlaylistsContainingSong(String songId) {
        return playlistRepository.findBySongIdsContaining(songId);
    }
}

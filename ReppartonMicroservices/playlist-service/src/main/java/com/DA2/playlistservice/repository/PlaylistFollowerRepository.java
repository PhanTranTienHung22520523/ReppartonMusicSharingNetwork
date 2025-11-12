package com.DA2.playlistservice.repository;

import com.DA2.playlistservice.entity.PlaylistFollower;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaylistFollowerRepository extends JpaRepository<PlaylistFollower, String> {

    // Check if user follows playlist
    Optional<PlaylistFollower> findByPlaylistIdAndUserId(String playlistId, String userId);

    // Get all followers of a playlist
    List<PlaylistFollower> findByPlaylistId(String playlistId);

    // Get all playlists followed by user
    List<PlaylistFollower> findByUserIdOrderByCreatedAtDesc(String userId);

    // Count followers
    long countByPlaylistId(String playlistId);

    // Delete follower relationship
    void deleteByPlaylistIdAndUserId(String playlistId, String userId);
}

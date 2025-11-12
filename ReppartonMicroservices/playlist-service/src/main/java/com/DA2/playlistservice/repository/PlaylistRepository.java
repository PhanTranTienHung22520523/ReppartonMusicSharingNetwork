package com.DA2.playlistservice.repository;

import com.DA2.playlistservice.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends JpaRepository<Playlist, String> {

    // Find playlists by user
    List<Playlist> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<Playlist> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    // Find public playlists
    List<Playlist> findByIsPrivateFalseOrderByCreatedAtDesc();
    Page<Playlist> findByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);

    // Find playlists by name (search)
    @Query("SELECT p FROM Playlist p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Playlist> searchByName(@Param("query") String query, Pageable pageable);

    // Find playlists containing a song
    @Query("SELECT p FROM Playlist p WHERE :songId MEMBER OF p.songIds")
    List<Playlist> findBySongIdsContaining(@Param("songId") String songId);

    // Find trending playlists (most followers)
    List<Playlist> findTop10ByOrderByFollowersDesc();

    // Count user's playlists
    long countByUserId(String userId);
}

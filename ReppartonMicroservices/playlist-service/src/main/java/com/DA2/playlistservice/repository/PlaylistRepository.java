package com.DA2.playlistservice.repository;

import com.DA2.playlistservice.entity.Playlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepository extends MongoRepository<Playlist, String> {
    
    // Find playlists by user
    List<Playlist> findByUserIdOrderByCreatedAtDesc(String userId);
    Page<Playlist> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    // Find public playlists
    List<Playlist> findByIsPrivateFalseOrderByCreatedAtDesc();
    Page<Playlist> findByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);
    
    // Find playlists by name (search)
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    Page<Playlist> searchByName(String query, Pageable pageable);
    
    // Find playlists containing a song
    List<Playlist> findBySongIdsContaining(String songId);
    
    // Find trending playlists (most followers)
    List<Playlist> findTop10ByOrderByFollowersDesc();
    
    // Count user's playlists
    long countByUserId(String userId);
}

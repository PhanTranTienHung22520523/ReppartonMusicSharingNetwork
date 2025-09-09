package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Playlist;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlaylistRepo extends MongoRepository<Playlist, String> {
    List<Playlist> findByUserId(String userId);
    List<Playlist> findByIsPrivate(boolean isPrivate);
    List<Playlist> findByNameContainingIgnoreCase(String name);
    List<Playlist> findByUserIdAndIsPrivate(String userId, boolean isPrivate);
    List<Playlist> findByIsPrivateOrderByCreatedAtDesc(boolean isPrivate);
}

package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepo extends MongoRepository<Like, String> {
    List<Like> findByUserId(String userId);
    List<Like> findBySongId(String songId);
    List<Like> findByPostId(String postId);
    Optional<Like> findByUserIdAndSongId(String userId, String songId);
    Optional<Like> findByUserIdAndPostId(String userId, String postId);
    boolean existsByUserIdAndSongId(String userId, String songId);
    boolean existsByUserIdAndPostId(String userId, String postId);
    long countBySongId(String songId);
    long countByPostId(String postId);
    void deleteByUserIdAndSongId(String userId, String songId);
    void deleteByUserIdAndPostId(String userId, String postId);
}

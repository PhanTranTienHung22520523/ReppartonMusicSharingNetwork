package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Follow;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepo extends MongoRepository<Follow, String> {
    List<Follow> findByFollowerId(String followerId);
    List<Follow> findByArtistId(String artistId);
    Optional<Follow> findByFollowerIdAndArtistId(String followerId, String artistId);
    boolean existsByFollowerIdAndArtistId(String followerId, String artistId);
    long countByArtistId(String artistId); // Đếm số followers
    long countByFollowerId(String followerId); // Đếm số following
    void deleteByFollowerIdAndArtistId(String followerId, String artistId);
}

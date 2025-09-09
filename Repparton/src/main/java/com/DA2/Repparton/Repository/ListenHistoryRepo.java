package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.ListenHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListenHistoryRepo extends MongoRepository<ListenHistory, String> {
    // Basic queries
    List<ListenHistory> findByUserId(String userId);
    List<ListenHistory> findBySongId(String songId);

    // Queries cần thiết cho SongService và RecommendationService
    List<ListenHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ListenHistory> findBySongIdOrderByCreatedAtDesc(String songId);

    // Count queries
    long countByUserId(String userId);
    long countBySongId(String songId);

    // Check existence
    boolean existsByUserIdAndSongId(String userId, String songId);
}

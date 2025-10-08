package com.DA2.analyticsservice.repository;

import com.DA2.analyticsservice.entity.ListenHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ListenHistoryRepository extends MongoRepository<ListenHistory, String> {
    List<ListenHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ListenHistory> findBySongId(String songId);
    
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<ListenHistory> findByDateRange(LocalDateTime start, LocalDateTime end);
    
    long countBySongId(String songId);
    long countByUserId(String userId);
}
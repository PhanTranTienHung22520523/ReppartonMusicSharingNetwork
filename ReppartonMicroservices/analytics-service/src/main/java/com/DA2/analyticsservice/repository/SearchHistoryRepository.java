package com.DA2.analyticsservice.repository;

import com.DA2.analyticsservice.entity.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends MongoRepository<SearchHistory, String> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(String userId);
    
    @Query("{ 'searchedAt': { $gte: ?0, $lte: ?1 } }")
    List<SearchHistory> findByDateRange(LocalDateTime start, LocalDateTime end);
    
    @Query("{ 'searchQuery': { $regex: ?0, $options: 'i' } }")
    List<SearchHistory> findByQueryContaining(String keyword);
}
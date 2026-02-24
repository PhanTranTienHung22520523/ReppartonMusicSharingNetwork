package com.DA2.analyticsservice.repository;

import com.DA2.analyticsservice.entity.SearchHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, String> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(String userId);

    List<SearchHistory> findBySearchedAtAfter(LocalDateTime searchedAt);

    List<SearchHistory> findBySearchedAtAfterAndSearchedAtLessThanEqual(LocalDateTime after, LocalDateTime untilInclusive);

    List<SearchHistory> findBySearchedAtBetween(LocalDateTime start, LocalDateTime end);

    List<SearchHistory> findBySearchQueryContainingIgnoreCase(String keyword);

    // =============================
    // Analytics dashboard (per user)
    // =============================

    interface TopQueryAgg {
        String getQuery();

        long getCount();

        LocalDateTime getLastTimestamp();
    }

    @Query(
            value = "SELECT search_query AS query, COUNT(*) AS count, MAX(searched_at) AS lastTimestamp " +
                    "FROM search_history " +
                    "WHERE user_id = :userId AND searched_at BETWEEN :from AND :to " +
                    "GROUP BY search_query " +
                    "ORDER BY count DESC " +
                    "LIMIT :limit",
            nativeQuery = true
    )
    List<TopQueryAgg> findTopQueriesBetween(@Param("userId") String userId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("limit") int limit);
}
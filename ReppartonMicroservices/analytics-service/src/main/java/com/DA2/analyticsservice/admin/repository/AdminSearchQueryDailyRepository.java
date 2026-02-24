package com.DA2.analyticsservice.admin.repository;

import com.DA2.analyticsservice.admin.entity.AdminSearchQueryDaily;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@Repository
public interface AdminSearchQueryDailyRepository extends JpaRepository<AdminSearchQueryDaily, String> {

    interface SearchQueryAgg {
        String getSearchQuery();
        long getSearches();
    }

    default void increment(LocalDate day, String query, long delta) {
        incrementInternal(UUID.randomUUID().toString(), day, query, delta);
    }

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO admin_search_query_daily (id, day, search_query, searches, created_at, updated_at)
        VALUES (:id, :day, :query, :delta, now(), now())
        ON CONFLICT (day, search_query)
        DO UPDATE SET searches = admin_search_query_daily.searches + EXCLUDED.searches, updated_at = now();
        """, nativeQuery = true)
    void incrementInternal(@Param("id") String id, @Param("day") LocalDate day, @Param("query") String query, @Param("delta") long delta);

    @Query(value = """
        SELECT search_query AS searchQuery, SUM(searches) AS searches
        FROM admin_search_query_daily
        WHERE day BETWEEN :from AND :to
        GROUP BY search_query
        ORDER BY searches DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<SearchQueryAgg> findTopQueriesBetween(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("limit") int limit);
}

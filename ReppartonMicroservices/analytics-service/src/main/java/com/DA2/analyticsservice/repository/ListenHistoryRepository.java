package com.DA2.analyticsservice.repository;

import com.DA2.analyticsservice.entity.ListenHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ListenHistoryRepository extends JpaRepository<ListenHistory, String> {
    List<ListenHistory> findByUserIdOrderByCreatedAtDesc(String userId);
    List<ListenHistory> findBySongId(String songId);
    List<ListenHistory> findByArtistIdOrderByCreatedAtDesc(String artistId);
    List<ListenHistory> findBySongIdOrderByCreatedAtDesc(String songId);
    
    // For genre learning: get recent listens for a user
    List<ListenHistory> findByUserIdAndCreatedAtAfterOrderByCreatedAtDesc(String userId, LocalDateTime createdAt);

    List<ListenHistory> findByCreatedAtAfter(LocalDateTime createdAt);

    List<ListenHistory> findByCreatedAtAfterAndCreatedAtLessThanEqual(LocalDateTime after, LocalDateTime untilInclusive);

    List<ListenHistory> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    long countBySongId(String songId);
    long countByUserId(String userId);

        // =============================
        // Analytics dashboard (per user)
        // =============================

        interface DailyPlaysAgg {
        LocalDate getDate();

        long getPlays();
        }

        interface TopSongAgg {
        String getSongId();

        String getArtistId();

        long getPlays();
        }

        @Query(value = "SELECT COUNT(*) FROM listen_history WHERE user_id = :userId AND created_at BETWEEN :from AND :to", nativeQuery = true)
        long countUserPlaysBetween(@Param("userId") String userId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

        @Query(value = "SELECT COUNT(DISTINCT artist_id) FROM listen_history WHERE user_id = :userId AND artist_id IS NOT NULL AND created_at BETWEEN :from AND :to", nativeQuery = true)
        long countDistinctArtistsBetween(@Param("userId") String userId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

        @Query(
            value = "SELECT DATE(created_at) AS date, COUNT(*) AS plays " +
                "FROM listen_history " +
                "WHERE user_id = :userId AND created_at BETWEEN :from AND :to " +
                "GROUP BY DATE(created_at) " +
                "ORDER BY date ASC",
            nativeQuery = true
        )
        List<DailyPlaysAgg> countDailyPlaysBetween(@Param("userId") String userId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

        @Query(
            value = "SELECT song_id AS songId, MAX(artist_id) AS artistId, COUNT(*) AS plays " +
                "FROM listen_history " +
                "WHERE user_id = :userId AND created_at BETWEEN :from AND :to " +
                "GROUP BY song_id " +
                "ORDER BY plays DESC " +
                "LIMIT :limit",
            nativeQuery = true
        )
        List<TopSongAgg> findTopSongsBetween(@Param("userId") String userId, @Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("limit") int limit);

        @Query(
            value = "SELECT song_id AS songId, MAX(artist_id) AS artistId, COUNT(*) AS plays " +
                "FROM listen_history " +
                "WHERE created_at BETWEEN :from AND :to " +
                "GROUP BY song_id " +
                "ORDER BY plays DESC " +
                "LIMIT :limit",
            nativeQuery = true
        )
        List<TopSongAgg> findGlobalTopSongsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to, @Param("limit") int limit);
}
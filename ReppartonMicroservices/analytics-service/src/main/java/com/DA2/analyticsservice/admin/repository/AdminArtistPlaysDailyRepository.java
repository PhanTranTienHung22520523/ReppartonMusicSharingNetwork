package com.DA2.analyticsservice.admin.repository;

import com.DA2.analyticsservice.admin.entity.AdminArtistPlaysDaily;
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
public interface AdminArtistPlaysDailyRepository extends JpaRepository<AdminArtistPlaysDaily, String> {

    interface ArtistPlaysAgg {
        String getArtistId();
        long getPlays();
    }

    default void increment(LocalDate day, String artistId, long delta) {
        incrementInternal(UUID.randomUUID().toString(), day, artistId, delta);
    }

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO admin_artist_plays_daily (id, day, artist_id, plays, created_at, updated_at)
        VALUES (:id, :day, :artistId, :delta, now(), now())
        ON CONFLICT (day, artist_id)
        DO UPDATE SET plays = admin_artist_plays_daily.plays + EXCLUDED.plays, updated_at = now();
        """, nativeQuery = true)
    void incrementInternal(@Param("id") String id, @Param("day") LocalDate day, @Param("artistId") String artistId, @Param("delta") long delta);

    @Query(value = """
        SELECT artist_id AS artistId, SUM(plays) AS plays
        FROM admin_artist_plays_daily
        WHERE day BETWEEN :from AND :to
        GROUP BY artist_id
        ORDER BY plays DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<ArtistPlaysAgg> findTopArtistsByPlaysBetween(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("limit") int limit);
}

package com.DA2.analyticsservice.admin.repository;

import com.DA2.analyticsservice.admin.entity.AdminSongPlaysDaily;
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
public interface AdminSongPlaysDailyRepository extends JpaRepository<AdminSongPlaysDaily, String> {

    interface SongPlaysAgg {
        String getSongId();
        long getPlays();
    }

    default void increment(LocalDate day, String songId, long delta) {
        incrementInternal(UUID.randomUUID().toString(), day, songId, delta);
    }

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO admin_song_plays_daily (id, day, song_id, plays, created_at, updated_at)
        VALUES (:id, :day, :songId, :delta, now(), now())
        ON CONFLICT (day, song_id)
        DO UPDATE SET plays = admin_song_plays_daily.plays + EXCLUDED.plays, updated_at = now();
        """, nativeQuery = true)
    void incrementInternal(@Param("id") String id, @Param("day") LocalDate day, @Param("songId") String songId, @Param("delta") long delta);

    @Query(value = """
        SELECT song_id AS songId, SUM(plays) AS plays
        FROM admin_song_plays_daily
        WHERE day BETWEEN :from AND :to
        GROUP BY song_id
        ORDER BY plays DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<SongPlaysAgg> findTopSongsByPlaysBetween(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("limit") int limit);
}

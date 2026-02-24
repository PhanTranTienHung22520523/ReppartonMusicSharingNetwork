package com.DA2.analyticsservice.admin.repository;

import com.DA2.analyticsservice.admin.entity.AdminUserListensDaily;
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
public interface AdminUserListensDailyRepository extends JpaRepository<AdminUserListensDaily, String> {

    interface UserListensAgg {
        String getUserId();
        long getListens();
    }

    default void increment(LocalDate day, String userId, long delta) {
        incrementInternal(UUID.randomUUID().toString(), day, userId, delta);
    }

    @Modifying
    @Transactional
    @Query(value = """
        INSERT INTO admin_user_listens_daily (id, day, user_id, listens, created_at, updated_at)
        VALUES (:id, :day, :userId, :delta, now(), now())
        ON CONFLICT (day, user_id)
        DO UPDATE SET listens = admin_user_listens_daily.listens + EXCLUDED.listens, updated_at = now();
        """, nativeQuery = true)
    void incrementInternal(@Param("id") String id, @Param("day") LocalDate day, @Param("userId") String userId, @Param("delta") long delta);

    @Query(value = """
        SELECT user_id AS userId, SUM(listens) AS listens
        FROM admin_user_listens_daily
        WHERE day BETWEEN :from AND :to
        GROUP BY user_id
        ORDER BY listens DESC
        LIMIT :limit
        """, nativeQuery = true)
    List<UserListensAgg> findTopUsersByListensBetween(@Param("from") LocalDate from, @Param("to") LocalDate to, @Param("limit") int limit);
}

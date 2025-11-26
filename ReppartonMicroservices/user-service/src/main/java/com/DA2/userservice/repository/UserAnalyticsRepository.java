package com.DA2.userservice.repository;

import com.DA2.userservice.entity.UserAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserAnalyticsRepository extends JpaRepository<UserAnalytics, String> {

    Optional<UserAnalytics> findByUserId(String userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAnalytics ua SET ua.followersCount = ua.followersCount + 1 WHERE ua.userId = :userId")
    void incrementFollowersCount(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAnalytics ua SET ua.followersCount = ua.followersCount - 1 WHERE ua.userId = :userId AND ua.followersCount > 0")
    void decrementFollowersCount(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAnalytics ua SET ua.followingCount = ua.followingCount + 1 WHERE ua.userId = :userId")
    void incrementFollowingCount(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAnalytics ua SET ua.followingCount = ua.followingCount - 1 WHERE ua.userId = :userId AND ua.followingCount > 0")
    void decrementFollowingCount(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAnalytics ua SET ua.postsCount = ua.postsCount + 1 WHERE ua.userId = :userId")
    void incrementPostsCount(@Param("userId") String userId);

    @Modifying
    @Transactional
    @Query("UPDATE UserAnalytics ua SET ua.loginCount = ua.loginCount + 1, ua.lastLoginTimestamp = CURRENT_TIMESTAMP WHERE ua.userId = :userId")
    void incrementLoginCount(@Param("userId") String userId);

    @Query("SELECT SUM(ua.followersCount) FROM UserAnalytics ua")
    Long getTotalFollowers();

    @Query("SELECT SUM(ua.postsCount) FROM UserAnalytics ua")
    Long getTotalPosts();

    @Query("SELECT COUNT(ua) FROM UserAnalytics ua WHERE ua.isArtist = true")
    Long getTotalArtists();
}
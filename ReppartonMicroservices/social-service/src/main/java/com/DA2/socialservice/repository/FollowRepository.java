package com.DA2.socialservice.repository;

import com.DA2.socialservice.entity.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, String> {

    Optional<Follow> findByFollowerIdAndFollowingId(String followerId, String followingId);

    List<Follow> findByFollowerId(String followerId); // Who user is following
    List<Follow> findByFollowingId(String followingId); // Who follows the user

    long countByFollowerId(String followerId); // Following count
    long countByFollowingId(String followingId); // Followers count

    void deleteByFollowerIdAndFollowingId(String followerId, String followingId);
}
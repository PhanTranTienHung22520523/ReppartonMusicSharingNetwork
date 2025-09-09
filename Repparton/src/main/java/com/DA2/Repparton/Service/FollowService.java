package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Follow;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.FollowRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FollowService {

    @Autowired
    private FollowRepo followRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public boolean followUser(String followerId, String artistId) {
        // Prevent self-following
        if (followerId.equals(artistId)) {
            throw new RuntimeException("Cannot follow yourself");
        }

        // Check if user exists
        User artist = userRepo.findById(artistId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        User follower = userRepo.findById(followerId)
                .orElseThrow(() -> new RuntimeException("Follower not found"));

        // Check if already following
        if (followRepo.existsByFollowerIdAndArtistId(followerId, artistId)) {
            throw new RuntimeException("Already following this user");
        }

        // Sử dụng constructor có tham số thay vì setter
        Follow follow = new Follow(followerId, artistId);

        followRepo.save(follow);

        // Send notification to the followed user
        notificationService.sendNotification(
                artistId,
                follower.getUsername() + " started following you",
                "FOLLOW",
                followerId
        );

        System.out.println("User " + followerId + " followed user " + artistId);
        return false;
    }

    @Transactional
    public boolean unfollowUser(String followerId, String artistId) {
        Optional<Follow> followOpt = followRepo.findByFollowerIdAndArtistId(followerId, artistId);

        if (followOpt.isPresent()) {
            followRepo.delete(followOpt.get());
            System.out.println("User " + followerId + " unfollowed user " + artistId);
        } else {
            throw new RuntimeException("Not following this user");
        }
        return false;
    }

    public List<User> getFollowers(String userId) {
        List<Follow> follows = followRepo.findByArtistId(userId);
        List<String> followerIds = follows.stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());
        return userRepo.findAllById(followerIds);
    }

    public List<User> getFollowing(String userId) {
        List<Follow> follows = followRepo.findByFollowerId(userId);
        List<String> followingIds = follows.stream()
                .map(Follow::getArtistId)
                .collect(Collectors.toList());
        return userRepo.findAllById(followingIds);
    }

    public List<String> getFollowingIds(String userId) {
        List<Follow> follows = followRepo.findByFollowerId(userId);
        return follows.stream()
                .map(Follow::getArtistId)
                .collect(Collectors.toList());
    }

    public boolean isFollowing(String followerId, String artistId) {
        return followRepo.existsByFollowerIdAndArtistId(followerId, artistId);
    }

    public long getFollowerCount(String userId) {
        return followRepo.countByArtistId(userId);
    }

    public long getFollowingCount(String followerId) {
        return followRepo.countByFollowerId(followerId);
    }
}

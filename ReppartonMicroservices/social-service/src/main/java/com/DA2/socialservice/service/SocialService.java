package com.DA2.socialservice.service;

import com.DA2.socialservice.entity.Follow;
import com.DA2.socialservice.entity.Like;
import com.DA2.socialservice.entity.Share;
import com.DA2.socialservice.repository.FollowRepository;
import com.DA2.socialservice.repository.LikeRepository;
import com.DA2.socialservice.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class SocialService {

    @Autowired
    private FollowRepository followRepository;

    @Autowired
    private LikeRepository likeRepository;

    @Autowired
    private ShareRepository shareRepository;

    // FOLLOW OPERATIONS
    @Transactional
    public void followUser(String followerId, String followingId) {
        if (followerId.equals(followingId)) {
            throw new RuntimeException("Cannot follow yourself");
        }
        
        Optional<Follow> existing = followRepository.findByFollowerIdAndFollowingId(followerId, followingId);
        if (existing.isPresent()) {
            throw new RuntimeException("Already following");
        }
        
        Follow follow = new Follow(followerId, followingId);
        followRepository.save(follow);
    }

    @Transactional
    public void unfollowUser(String followerId, String followingId) {
        Follow follow = followRepository.findByFollowerIdAndFollowingId(followerId, followingId)
                .orElseThrow(() -> new RuntimeException("Not following"));
        followRepository.delete(follow);
    }

    public boolean isFollowing(String followerId, String followingId) {
        return followRepository.findByFollowerIdAndFollowingId(followerId, followingId).isPresent();
    }

    public List<String> getFollowers(String userId) {
        return followRepository.findByFollowingId(userId).stream()
                .map(Follow::getFollowerId)
                .collect(Collectors.toList());
    }

    public List<String> getFollowing(String userId) {
        return followRepository.findByFollowerId(userId).stream()
                .map(Follow::getFollowingId)
                .collect(Collectors.toList());
    }

    public long getFollowersCount(String userId) {
        return followRepository.countByFollowingId(userId);
    }

    public long getFollowingCount(String userId) {
        return followRepository.countByFollowerId(userId);
    }

    // LIKE OPERATIONS
    @Transactional
    public void likeItem(String userId, String itemId, String itemType) {
        Optional<Like> existing = likeRepository.findByUserIdAndItemIdAndItemType(userId, itemId, itemType);
        if (existing.isPresent()) {
            throw new RuntimeException("Already liked");
        }
        
        Like like = new Like(userId, itemId, itemType);
        likeRepository.save(like);
    }

    @Transactional
    public void unlikeItem(String userId, String itemId, String itemType) {
        Like like = likeRepository.findByUserIdAndItemIdAndItemType(userId, itemId, itemType)
                .orElseThrow(() -> new RuntimeException("Not liked"));
        likeRepository.delete(like);
    }

    public boolean isLiked(String userId, String itemId, String itemType) {
        return likeRepository.findByUserIdAndItemIdAndItemType(userId, itemId, itemType).isPresent();
    }

    public long getLikesCount(String itemId, String itemType) {
        return likeRepository.countByItemIdAndItemType(itemId, itemType);
    }

    public List<Like> getUserLikes(String userId) {
        return likeRepository.findByUserId(userId);
    }

    // SHARE OPERATIONS
    @Transactional
    public void shareItem(String userId, String itemId, String itemType) {
        Share share = new Share(userId, itemId, itemType);
        shareRepository.save(share);
    }

    public long getSharesCount(String itemId, String itemType) {
        return shareRepository.countByItemIdAndItemType(itemId, itemType);
    }

    public List<Share> getUserShares(String userId) {
        return shareRepository.findByUserId(userId);
    }
}

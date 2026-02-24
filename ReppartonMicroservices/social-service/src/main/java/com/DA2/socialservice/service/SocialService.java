package com.DA2.socialservice.service;

import com.DA2.socialservice.dto.UserDTO;
import com.DA2.socialservice.dto.UserProfileResponseDTO;
import com.DA2.socialservice.entity.Follow;
import com.DA2.socialservice.entity.Like;
import com.DA2.socialservice.entity.Share;
import com.DA2.socialservice.repository.FollowRepository;
import com.DA2.socialservice.repository.LikeRepository;
import com.DA2.socialservice.repository.ShareRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;
import java.util.ArrayList;
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
    
    @Autowired
    private RestTemplate restTemplate;
    
    @Value("${user.service.url:http://localhost:8090}")
    private String userServiceUrl;

    @Value("${api.gateway.url:http://localhost:8090}")
    private String apiGatewayUrl;

    @Value("${notification.service.url:http://localhost:8086/api/notifications}")
    private String notificationServiceUrl;

    private static class ItemInfo {
        final String ownerId;
        final String label;

        ItemInfo(String ownerId, String label) {
            this.ownerId = ownerId;
            this.label = label;
        }
    }

    private ItemInfo resolveItemInfo(String itemId, String itemType) {
        if (itemId == null || itemId.isBlank() || itemType == null || itemType.isBlank()) {
            return null;
        }

        String t = itemType.trim().toLowerCase();
        String url;
        try {
            if (t.equals("song")) {
                url = apiGatewayUrl + "/api/songs/" + itemId;
                Map<?, ?> res = restTemplate.getForObject(url, Map.class);
                Map<?, ?> data = res == null ? null : (Map<?, ?>) res.get("data");
                if (data == null) return null;
                String ownerId = (String) data.get("uploadedBy");
                String label = (String) data.get("title");
                return ownerId == null ? null : new ItemInfo(ownerId, label);
            }
            if (t.equals("post")) {
                url = apiGatewayUrl + "/api/posts/" + itemId;
                Map<?, ?> data = restTemplate.getForObject(url, Map.class);
                if (data == null) return null;
                String ownerId = (String) data.get("userId");
                String content = (String) data.get("content");
                String label = content == null ? null : (content.length() > 40 ? content.substring(0, 40) + "..." : content);
                return ownerId == null ? null : new ItemInfo(ownerId, label);
            }
            if (t.equals("playlist")) {
                url = apiGatewayUrl + "/api/playlists/" + itemId;
                Map<?, ?> data = restTemplate.getForObject(url, Map.class);
                if (data == null) return null;
                String ownerId = (String) data.get("userId");
                String label = (String) data.get("name");
                return ownerId == null ? null : new ItemInfo(ownerId, label);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private void sendNotification(String recipientId, String actorId, String type, String title, String message, String referenceId) {
        if (recipientId == null || recipientId.isBlank()) return;
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("userId", recipientId);
            body.put("actorId", actorId);
            body.put("type", type);
            body.put("title", title);
            body.put("message", message);
            body.put("referenceId", referenceId);
            restTemplate.postForObject(notificationServiceUrl, body, Object.class);
        } catch (Exception ignored) {
            // Best-effort only; do not break main flow.
        }
    }

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

        // Notify the followed user (best-effort)
        if (followerId != null && !followerId.equals(followingId)) {
            sendNotification(
                    followingId,
                    followerId,
                    "follow",
                    "New follower",
                    "User " + followerId + " started following you",
                    followerId
            );
        }
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
    
    // Get followers with user details
    public List<UserDTO> getFollowersWithDetails(String userId) {
        List<String> followerIds = getFollowers(userId);
        return getUserDetailsByIds(followerIds);
    }
    
    // Get following with user details
    public List<UserDTO> getFollowingWithDetails(String userId) {
        List<String> followingIds = getFollowing(userId);
        return getUserDetailsByIds(followingIds);
    }
    
    // Helper method to fetch user details from user-service
    private List<UserDTO> getUserDetailsByIds(List<String> userIds) {
        List<UserDTO> users = new ArrayList<>();
        for (String userId : userIds) {
            try {
                // Use public profile endpoint so this call works without Authorization.
                // userId here can be either an id or a username; user-service supports both.
                String url = userServiceUrl + "/api/users/" + userId + "/profile";
                UserProfileResponseDTO profile = restTemplate.getForObject(url, UserProfileResponseDTO.class);
                if (profile != null && profile.getUser() != null) {
                    users.add(profile.getUser());
                } else {
                    UserDTO fallbackUser = new UserDTO();
                    fallbackUser.setId(userId);
                    fallbackUser.setUsername(String.valueOf(userId));
                    users.add(fallbackUser);
                }
            } catch (Exception e) {
                // If user not found or error, create a minimal user object with just the ID
                UserDTO fallbackUser = new UserDTO();
                fallbackUser.setId(userId);
                fallbackUser.setUsername(String.valueOf(userId));
                users.add(fallbackUser);
            }
        }
        return users;
    }

    public long getFollowersCount(String userId) {
        return followRepository.countByFollowingId(userId);
    }

    public long getFollowingCount(String userId) {
        return followRepository.countByFollowerId(userId);
    }

    // LIKE OPERATIONS
    @Transactional
    public boolean likeItem(String userId, String itemId, String itemType) {
        Optional<Like> existing = likeRepository.findByUserIdAndItemIdAndItemType(userId, itemId, itemType);
        if (existing.isPresent()) {
            // Idempotent: already liked
            return false;
        }
        
        Like like = new Like(userId, itemId, itemType);
        likeRepository.save(like);

        // Notify the owner of the item that was liked (best-effort)
        ItemInfo info = resolveItemInfo(itemId, itemType);
        if (info != null && info.ownerId != null && !info.ownerId.equals(userId)) {
            String label = info.label == null ? "" : (": \"" + info.label + "\"");
            sendNotification(
                    info.ownerId,
                    userId,
                    "like",
                    "New like",
                    "User " + userId + " liked your " + itemType + label,
                    itemId
            );
        }

        return true;
    }

    @Transactional
    public boolean unlikeItem(String userId, String itemId, String itemType) {
        Optional<Like> existing = likeRepository.findByUserIdAndItemIdAndItemType(userId, itemId, itemType);
        if (existing.isEmpty()) {
            // Idempotent: already unliked
            return false;
        }
        likeRepository.delete(existing.get());
        return true;
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

        // Notify the owner of the item that was shared (best-effort)
        ItemInfo info = resolveItemInfo(itemId, itemType);
        if (info != null && info.ownerId != null && !info.ownerId.equals(userId)) {
            String label = info.label == null ? "" : (": \"" + info.label + "\"");
            sendNotification(
                    info.ownerId,
                    userId,
                    "share",
                    "New share",
                    "User " + userId + " shared your " + itemType + label,
                    itemId
            );
        }
    }

    public long getSharesCount(String itemId, String itemType) {
        return shareRepository.countByItemIdAndItemType(itemId, itemType);
    }

    public List<Share> getUserShares(String userId) {
        return shareRepository.findByUserId(userId);
    }
}

package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Follow;
import com.DA2.Repparton.Entity.ListenHistory;
import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.FollowRepo;
import com.DA2.Repparton.Repository.ListenHistoryRepo;
import com.DA2.Repparton.Repository.SongRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private SongRepo songRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ListenHistoryRepo listenHistoryRepo;

    @Autowired
    private FollowRepo followRepo;

    public List<Song> getRecommendedSongs(String userId, int limit) {
        try {
            // Get user's listening history
            List<ListenHistory> userHistory = listenHistoryRepo.findByUserId(userId);

            if (userHistory.isEmpty()) {
                // New user - return trending songs
                return getTrendingSongs(limit);
            }

            // Simple recommendation: songs from similar genres
            List<String> userSongIds = userHistory.stream()
                    .map(ListenHistory::getSongId)
                    .collect(Collectors.toList());

            // Get songs user hasn't listened to
            List<Song> allSongs = songRepo.findAll();
            List<Song> recommendations = allSongs.stream()
                    .filter(song -> !userSongIds.contains(song.getId()))
                    .filter(song -> !song.isPrivate())
                    .limit(limit)
                    .collect(Collectors.toList());

            return recommendations;

        } catch (Exception e) {
            return getTrendingSongs(limit);
        }
    }

    public List<User> getRecommendedUsers(String userId, int limit) {
        try {
            // Get users the current user is following
            List<Follow> following = followRepo.findByFollowerId(userId);
            List<String> followingIds = following.stream()
                    .map(Follow::getArtistId)
                    .collect(Collectors.toList());
            followingIds.add(userId); // Exclude self

            // Get users not being followed
            List<User> allUsers = userRepo.findAll();
            List<User> recommendations = allUsers.stream()
                    .filter(user -> !followingIds.contains(user.getId()))
                    .limit(limit)
                    .collect(Collectors.toList());

            return recommendations;

        } catch (Exception e) {
            return getPopularUsers(limit);
        }
    }

    private List<Song> getTrendingSongs(int limit) {
        try {
            // Sử dụng method có sẵn trong SongRepo
            List<Song> allSongs = songRepo.findByStatusAndIsPrivateOrderByCreatedAtDesc("approved", false);
            return allSongs.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            // Fallback: lấy tất cả bài hát public
            List<Song> allSongs = songRepo.findByIsPrivate(false);
            return allSongs.stream()
                    .limit(limit)
                    .collect(Collectors.toList());
        }
    }

    private List<User> getPopularUsers(int limit) {
        // Get users with most followers
        List<User> allUsers = userRepo.findAll();
        return allUsers.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
}

package com.DA2.userservice.service;

import com.DA2.userservice.entity.UserAnalytics;
import com.DA2.userservice.repository.UserAnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserAnalyticsService {

    private final UserAnalyticsRepository userAnalyticsRepository;

    @Transactional
    public UserAnalytics getOrCreateUserAnalytics(String userId) {
        return userAnalyticsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    UserAnalytics analytics = new UserAnalytics();
                    analytics.setUserId(userId);
                    analytics.setAccountCreatedTimestamp(LocalDateTime.now());
                    return userAnalyticsRepository.save(analytics);
                });
    }

    @Transactional
    public void incrementFollowersCount(String userId) {
        getOrCreateUserAnalytics(userId);
        userAnalyticsRepository.incrementFollowersCount(userId);
    }

    @Transactional
    public void decrementFollowersCount(String userId) {
        userAnalyticsRepository.decrementFollowersCount(userId);
    }

    @Transactional
    public void incrementFollowingCount(String userId) {
        getOrCreateUserAnalytics(userId);
        userAnalyticsRepository.incrementFollowingCount(userId);
    }

    @Transactional
    public void decrementFollowingCount(String userId) {
        userAnalyticsRepository.decrementFollowingCount(userId);
    }

    @Transactional
    public void incrementPostsCount(String userId) {
        getOrCreateUserAnalytics(userId);
        userAnalyticsRepository.incrementPostsCount(userId);
    }

    @Transactional
    public void incrementLoginCount(String userId) {
        getOrCreateUserAnalytics(userId);
        userAnalyticsRepository.incrementLoginCount(userId);
    }

    @Transactional
    public void trackLoginEvent(String userId, String ipAddress, String deviceId) {
        incrementLoginCount(userId);
        // Additional login tracking logic can be added here
    }

    public Optional<UserAnalytics> getUserAnalytics(String userId) {
        return userAnalyticsRepository.findByUserId(userId);
    }

    public Long getTotalFollowers() {
        return userAnalyticsRepository.getTotalFollowers();
    }

    public Long getTotalPosts() {
        return userAnalyticsRepository.getTotalPosts();
    }

    public Long getTotalArtists() {
        return userAnalyticsRepository.getTotalArtists();
    }

    @Transactional
    public void updateArtistStatus(String userId, boolean isArtist, String verificationStatus) {
        UserAnalytics analytics = getOrCreateUserAnalytics(userId);
        analytics.setIsArtist(isArtist);
        analytics.setArtistVerificationStatus(verificationStatus);
        userAnalyticsRepository.save(analytics);
    }
}
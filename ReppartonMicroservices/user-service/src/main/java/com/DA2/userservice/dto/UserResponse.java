package com.DA2.userservice.dto;

import com.DA2.userservice.entity.User;
import lombok.Builder;
import lombok.Value;

import java.time.LocalDateTime;

@Value
@Builder
public class UserResponse {
    String id;
    String username;
    String email;
    String firstName;
    String lastName;
    String fullName;
    String displayName;
    String avatarUrl;
    String coverUrl;
    String bio;
    String website;
    String role;
    boolean verified;
    boolean artistPending;
    int followersCount;
    int followingCount;
    boolean isOnboarded;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;

    public static UserResponse fromEntity(User user) {
        if (user == null) {
            return null;
        }

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
            .displayName(user.getDisplayName())
                .avatarUrl(user.getAvatarUrl())
                .coverUrl(user.getCoverUrl())
                .bio(user.getBio())
            .website(user.getWebsite())
                .role(user.getRole())
                .verified(user.isVerified())
                .artistPending(user.isArtistPending())
                .followersCount(user.getFollowersCount())
                .followingCount(user.getFollowingCount())
                .isOnboarded(user.isOnboarded())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

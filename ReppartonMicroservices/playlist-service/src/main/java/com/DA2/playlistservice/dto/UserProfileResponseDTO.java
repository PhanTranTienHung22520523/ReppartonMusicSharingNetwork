package com.DA2.playlistservice.dto;

public record UserProfileResponseDTO(
        UserSummary user,
        long followerNumber,
        long followingNumber,
        long postsCount,
        long songsCount
) {
}

package com.DA2.playlistservice.dto;

import java.time.LocalDateTime;

public record PlaylistSearchResponse(
        String id,
        String userId,
        UserSummary user,
        String name,
        String description,
        String coverUrl,
        int songCount,
        int followers,
        boolean isPrivate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}

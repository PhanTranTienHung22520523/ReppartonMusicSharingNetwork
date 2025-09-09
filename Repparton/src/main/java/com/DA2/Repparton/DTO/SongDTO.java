package com.DA2.Repparton.DTO;

import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SongDTO {
    private String id;
    private String title;
    private String artistId;
    private String artistName;
    private String audioUrl;
    private String coverUrl;
    private String description;
    private List<String> genreIds;
    private boolean isPrivate;
    private String status;
    private int views;
    private int likes;
    private int shares;
    private int duration;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Artist information
    private ArtistInfo artist;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ArtistInfo {
        private String id;
        private String name;
        private String username;
        private String avatarUrl;
    }

    // Helper method to create SongDTO from Song and User entities
    public static SongDTO fromSongAndArtist(Song song, User artist) {
        ArtistInfo artistInfo = null;
        String artistName = "Unknown Artist";
        
        if (artist != null) {
            artistName = artist.getUsername();
            artistInfo = ArtistInfo.builder()
                .id(artist.getId())
                .name(artist.getUsername())
                .username(artist.getUsername())
                .avatarUrl(artist.getAvatarUrl())
                .build();
        }

        return SongDTO.builder()
            .id(song.getId())
            .title(song.getTitle())
            .artistId(song.getArtistId())
            .artistName(artistName)
            .audioUrl(song.getAudioUrl())
            .coverUrl(song.getCoverUrl())
            .description(song.getDescription())
            .genreIds(song.getGenreIds())
            .isPrivate(song.isPrivate())
            .status(song.getStatus())
            .views(song.getViews())
            .likes(song.getLikes())
            .shares(song.getShares())
            .duration(song.getDuration())
            .createdAt(song.getCreatedAt())
            .updatedAt(song.getUpdatedAt())
            .artist(artistInfo)
            .build();
    }
}

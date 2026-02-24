package com.DA2.userservice.dto;

import lombok.Data;

@Data
public class UpdateUserSettingsRequest {
    private String language;
    private String theme;
    private Notifications notifications;
    private Privacy privacy;
    private Audio audio;
    private InterfaceSettings interfaceSettings;

    @Data
    public static class Notifications {
        private Boolean likes;
        private Boolean comments;
        private Boolean followers;
        private Boolean newMusic;
        private Boolean email;
        private Boolean push;
    }

    @Data
    public static class Privacy {
        private Boolean publicProfile;
        private Boolean showActivity;
        private Boolean publicPlaylists;
        private String whoCanMsg;
    }

    @Data
    public static class Audio {
        private String quality;
        private Boolean autoplay;
        private Boolean crossfade;
        private Integer volume;
        private Integer fadeInDuration;
    }

    @Data
    public static class InterfaceSettings {
        private Boolean showWaveform;
        private Boolean showLyrics;
        private Boolean compactMode;
        private Boolean animationsEnabled;
    }
}

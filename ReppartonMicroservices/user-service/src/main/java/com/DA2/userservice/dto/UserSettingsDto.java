package com.DA2.userservice.dto;

import com.DA2.userservice.entity.User;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class UserSettingsDto {
    String language;
    String theme;
    Notifications notifications;
    Privacy privacy;
    Audio audio;
    InterfaceSettings interfaceSettings;

    public static UserSettingsDto fromEntity(User.UserSettings settings) {
        if (settings == null) {
            return null;
        }

        return UserSettingsDto.builder()
                .language(settings.getLanguage())
                .theme(settings.getTheme())
                .notifications(Notifications.fromEntity(settings.getNotifications()))
                .privacy(Privacy.fromEntity(settings.getPrivacy()))
                .audio(Audio.fromEntity(settings.getAudio()))
                .interfaceSettings(InterfaceSettings.fromEntity(settings.getInterfaceSettings()))
                .build();
    }

    @Value
    @Builder
    public static class Notifications {
        boolean likes;
        boolean comments;
        boolean followers;
        boolean newMusic;
        boolean email;
        boolean push;

        public static Notifications fromEntity(User.Notifications n) {
            if (n == null) {
                return null;
            }
            return Notifications.builder()
                    .likes(n.isLikes())
                    .comments(n.isComments())
                    .followers(n.isFollowers())
                    .newMusic(n.isNewMusic())
                    .email(n.isEmail())
                    .push(n.isPush())
                    .build();
        }
    }

    @Value
    @Builder
    public static class Privacy {
        boolean publicProfile;
        boolean showActivity;
        boolean publicPlaylists;
        String whoCanMsg;

        public static Privacy fromEntity(User.Privacy p) {
            if (p == null) {
                return null;
            }
            return Privacy.builder()
                    .publicProfile(p.isPublicProfile())
                    .showActivity(p.isShowActivity())
                    .publicPlaylists(p.isPublicPlaylists())
                    .whoCanMsg(p.getWhoCanMsg())
                    .build();
        }
    }

    @Value
    @Builder
    public static class Audio {
        String quality;
        boolean autoplay;
        boolean crossfade;
        int volume;
        int fadeInDuration;

        public static Audio fromEntity(User.Audio a) {
            if (a == null) {
                return null;
            }
            return Audio.builder()
                    .quality(a.getQuality())
                    .autoplay(a.isAutoplay())
                    .crossfade(a.isCrossfade())
                    .volume(a.getVolume())
                    .fadeInDuration(a.getFadeInDuration())
                    .build();
        }
    }

    @Value
    @Builder
    public static class InterfaceSettings {
        boolean showWaveform;
        boolean showLyrics;
        boolean compactMode;
        boolean animationsEnabled;

        public static InterfaceSettings fromEntity(User.InterfaceSettings i) {
            if (i == null) {
                return null;
            }
            return InterfaceSettings.builder()
                    .showWaveform(i.isShowWaveform())
                    .showLyrics(i.isShowLyrics())
                    .compactMode(i.isCompactMode())
                    .animationsEnabled(i.isAnimationsEnabled())
                    .build();
        }
    }
}

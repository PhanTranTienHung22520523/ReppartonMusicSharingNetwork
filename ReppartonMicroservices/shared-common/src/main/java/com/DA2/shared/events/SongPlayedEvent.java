package com.DA2.shared.events;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SongPlayedEvent extends BaseEvent {
    private String songId;
    private String songTitle;
    private String artistName;
    private Long playCount;
    
    public SongPlayedEvent(String eventId, String userId, String songId, String songTitle, String artistName, Long playCount) {
        super(eventId, "SONG_PLAYED", java.time.LocalDateTime.now(), "song-service", userId);
        this.songId = songId;
        this.songTitle = songTitle;
        this.artistName = artistName;
        this.playCount = playCount;
    }
}

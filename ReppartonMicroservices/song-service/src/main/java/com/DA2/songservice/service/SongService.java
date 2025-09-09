package com.DA2.songservice.service;

import com.DA2.songservice.entity.Song;
import com.DA2.songservice.repository.SongRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SongService {
    
    private final SongRepository songRepository;

    public List<Song> getAllPublicSongs() {
        return songRepository.findByIsPublicTrueAndIsActiveTrue();
    }

    public Song getSongById(String id) {
        return songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found with id: " + id));
    }

    public List<Song> searchSongs(String query) {
        // Simple search by title or artist
        List<Song> titleResults = songRepository.findByTitleContainingIgnoreCase(query);
        List<Song> artistResults = songRepository.findByArtistContainingIgnoreCase(query);
        
        // Combine results (remove duplicates in real implementation)
        titleResults.addAll(artistResults);
        return titleResults;
    }

    public List<Song> getSongsByUser(String userId) {
        return songRepository.findByUploadedBy(userId);
    }

    public Song createSong(Song song) {
        song.setCreatedAt(LocalDateTime.now());
        song.setUpdatedAt(LocalDateTime.now());
        return songRepository.save(song);
    }

    public Song updateSong(String id, Song songUpdate, String userId) {
        Song existingSong = getSongById(id);
        
        // Check if user owns the song
        if (!existingSong.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only update your own songs");
        }

        existingSong.setTitle(songUpdate.getTitle());
        existingSong.setArtist(songUpdate.getArtist());
        existingSong.setDescription(songUpdate.getDescription());
        existingSong.setGenres(songUpdate.getGenres());
        existingSong.setPublic(songUpdate.isPublic());
        existingSong.setUpdatedAt(LocalDateTime.now());

        return songRepository.save(existingSong);
    }

    public void deleteSong(String id, String userId) {
        Song song = getSongById(id);
        
        // Check if user owns the song
        if (!song.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only delete your own songs");
        }

        songRepository.deleteById(id);
    }

    public Song incrementPlayCount(String id) {
        Song song = getSongById(id);
        song.setPlaysCount(song.getPlaysCount() + 1);
        return songRepository.save(song);
    }

    public Song incrementLikeCount(String id) {
        Song song = getSongById(id);
        song.setLikesCount(song.getLikesCount() + 1);
        return songRepository.save(song);
    }

    public Song decrementLikeCount(String id) {
        Song song = getSongById(id);
        song.setLikesCount(Math.max(0, song.getLikesCount() - 1));
        return songRepository.save(song);
    }
}

package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Playlist;
import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.DTO.PlaylistDTO;
import com.DA2.Repparton.Repository.PlaylistRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlaylistService {

    @Autowired
    private PlaylistRepo playlistRepository;

    @Autowired
    private SongService songService;

    @Autowired
    private UserService userService;

    public Playlist createPlaylist(String name, String userId, boolean isPrivate) {
        Playlist playlist = new Playlist();
        playlist.setName(name);
        playlist.setUserId(userId);
        playlist.setPrivate(isPrivate);
        playlist.setCreatedAt(LocalDateTime.now());
        playlist.setSongIds(List.of()); // empty list initially
        return playlistRepository.save(playlist);
    }

    public Optional<Playlist> getById(String id) {
        return playlistRepository.findById(id);
    }

    public List<Playlist> getByUser(String userId) {
        return playlistRepository.findByUserId(userId);
    }

    public Optional<Playlist> addSong(String playlistId, String songId) {
        Optional<Playlist> optional = playlistRepository.findById(playlistId);
        if (optional.isPresent()) {
            Playlist playlist = optional.get();
            if (!playlist.getSongIds().contains(songId)) {
                playlist.getSongIds().add(songId);
                playlistRepository.save(playlist);
            }
            return Optional.of(playlist);
        }
        return Optional.empty();
    }

    public Optional<Playlist> removeSong(String playlistId, String songId) {
        Optional<Playlist> optional = playlistRepository.findById(playlistId);
        if (optional.isPresent()) {
            Playlist playlist = optional.get();
            playlist.getSongIds().remove(songId);
            playlistRepository.save(playlist);
            return Optional.of(playlist);
        }
        return Optional.empty();
    }

    public void deletePlaylist(String id) {
        playlistRepository.deleteById(id);
    }

    // Search methods
    public List<Playlist> searchPlaylists(String query) {
        return playlistRepository.findByNameContainingIgnoreCase(query);
    }

    public Page<Playlist> searchPlaylists(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // For now, convert List to Page manually since the repo method returns List
        List<Playlist> playlists = playlistRepository.findByNameContainingIgnoreCase(query);
        int start = Math.min(page * size, playlists.size());
        int end = Math.min((page + 1) * size, playlists.size());
        List<Playlist> pageContent = playlists.subList(start, end);
        return new org.springframework.data.domain.PageImpl<>(pageContent, pageable, playlists.size());
    }

    public List<Playlist> getPublicPlaylists() {
        return playlistRepository.findByIsPrivateOrderByCreatedAtDesc(false);
    }

    // Convert Playlist entity to PlaylistDTO with song details
    public PlaylistDTO convertToDTO(Playlist playlist) {
        PlaylistDTO dto = new PlaylistDTO();
        dto.setId(playlist.getId());
        dto.setName(playlist.getName());
        dto.setDescription(playlist.getDescription());
        dto.setPublic(!playlist.isPrivate());
        dto.setUserId(playlist.getUserId());
        dto.setCreatedAt(playlist.getCreatedAt());
        dto.setUpdatedAt(playlist.getUpdatedAt());
        
        // Get user details
        if (playlist.getUserId() != null) {
            dto.setUser(userService.findById(playlist.getUserId()));
        }
        
        // Get song details
        List<Song> songs = songService.getSongsByIds(playlist.getSongIds());
        dto.setSongs(songs);
        
        return dto;
    }

    // Convert list of playlists to DTOs
    public List<PlaylistDTO> convertToDTOs(List<Playlist> playlists) {
        return playlists.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get playlist DTO by ID
    public Optional<PlaylistDTO> getPlaylistDTOById(String id) {
        Optional<Playlist> playlist = playlistRepository.findById(id);
        return playlist.map(this::convertToDTO);
    }

    // Get user's playlists as DTOs
    public List<PlaylistDTO> getUserPlaylistDTOs(String userId) {
        List<Playlist> playlists = playlistRepository.findByUserId(userId);
        return convertToDTOs(playlists);
    }
}

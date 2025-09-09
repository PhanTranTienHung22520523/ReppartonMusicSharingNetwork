package com.DA2.songservice.repository;

import com.DA2.songservice.entity.Song;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SongRepository extends MongoRepository<Song, String> {
    List<Song> findByUploadedBy(String uploadedBy);
    List<Song> findByTitleContainingIgnoreCase(String title);
    List<Song> findByArtistContainingIgnoreCase(String artist);
    List<Song> findByGenresContaining(String genre);
    List<Song> findByIsPublicTrueAndIsActiveTrue();
    List<Song> findTop10ByOrderByPlaysCountDesc();
    List<Song> findTop10ByOrderByCreatedAtDesc();
}

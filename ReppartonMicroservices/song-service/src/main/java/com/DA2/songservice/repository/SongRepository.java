package com.DA2.songservice.repository;

import com.DA2.songservice.entity.Song;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

@Repository
public interface SongRepository extends MongoRepository<Song, String> {
    List<Song> findByUploadedBy(String uploadedBy);
    List<Song> findByTitleContainingIgnoreCase(String title);
    List<Song> findByArtistContainingIgnoreCase(String artist);
    List<Song> findByGenresContaining(String genre);
    List<Song> findByIsPublicTrueAndIsActiveTrue();
    Page<Song> findByIsPublicTrueAndIsActiveTrue(Pageable pageable);

        // Legacy-friendly: treat missing/null isPublic/isActive as true.
        @Query("{ $and: [" +
            "  { $or: [ { 'isPublic': true }, { 'isPublic': { $exists: false } }, { 'isPublic': null } ] }," +
            "  { $or: [ { 'isActive': true }, { 'isActive': { $exists: false } }, { 'isActive': null } ] }" +
            "] }")
        List<Song> findPublicActiveOrLegacy();

        @Query("{ $and: [" +
            "  { $or: [ { 'isPublic': true }, { 'isPublic': { $exists: false } }, { 'isPublic': null } ] }," +
            "  { $or: [ { 'isActive': true }, { 'isActive': { $exists: false } }, { 'isActive': null } ] }" +
            "] }")
        Page<Song> findPublicActiveOrLegacy(Pageable pageable);

    List<Song> findTop10ByOrderByPlaysCountDesc();
    List<Song> findTop10ByOrderByCreatedAtDesc();
}

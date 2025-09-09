package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Song;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SongRepo extends MongoRepository<Song, String> {
    // Basic queries
    List<Song> findByArtistId(String artistId);
    List<Song> findByStatus(String status);
    List<Song> findByIsPrivate(boolean isPrivate);
    List<Song> findByGenreIdsContaining(String genreId);
    List<Song> findByTitleContainingIgnoreCase(String title);
    List<Song> findByArtistIdAndStatus(String artistId, String status);
    List<Song> findByStatusAndIsPrivateOrderByCreatedAtDesc(String status, boolean isPrivate);
    List<Song> findByIdIn(List<String> ids);

    // Queries cần thiết cho SongService
    List<Song> findByArtistIdOrderByCreatedAtDesc(String artistId);
    Page<Song> findByIsPrivateFalseAndStatus(String status, Pageable pageable);
    Page<Song> findByTitleContainingIgnoreCaseAndIsPrivateFalseAndStatus(String title, String status, Pageable pageable);
    Page<Song> findByGenreIdsContainingAndIsPrivateFalseAndStatus(String genreId, String status, Pageable pageable);
    List<Song> findByIsPrivateFalseAndStatusOrderByViewsDesc(String status, Pageable pageable);
    List<Song> findByStatusOrderByCreatedAtAsc(String status);

    // Custom queries
    @Query("{ 'createdAt' : { $gte: ?0 } }")
    List<Song> findTrendingPosts(LocalDateTime since, int limit);

    @Query("{ 'genreIds': { $in: ?0 }, 'artistId': { $ne: ?1 }, 'isPrivate': false, 'status': 'approved' }")
    List<Song> findRecommendedSongs(List<String> genreIds, String excludeArtistId, Pageable pageable);
    
    // Custom query to search songs by title with MongoDB aggregation
    @Query("{ '$and': [ " +
           "{ '$or': [ " +
           "{ 'title': { '$regex': ?0, '$options': 'i' } } " +
           "] }, " +
           "{ 'isPrivate': false }, " +
           "{ 'status': ?1 } " +
           "] }")
    Page<Song> findByTitleSearchAndIsPrivateFalseAndStatus(String query, String status, Pageable pageable);
}

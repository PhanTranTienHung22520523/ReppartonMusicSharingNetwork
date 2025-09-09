package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepo extends MongoRepository<Post, String> {
    // Basic queries with proper method signatures
    Page<Post> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    List<Post> findByUserId(String userId);

    // Feed and search queries
    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<Post> findByUserIdInOrderByCreatedAtDesc(List<String> userIds, Pageable pageable);
    Page<Post> findByContentContainingIgnoreCaseOrderByCreatedAtDesc(String content, Pageable pageable);

    // Trending posts
    List<Post> findTop10ByOrderByLikesDescCreatedAtDesc();
    List<Post> findTop20ByOrderByLikesDescCreatedAtDesc();

    // Custom queries for better performance
    @Query("{ 'userId': { $in: ?0 } }")
    Page<Post> findByUserIdIn(List<String> userIds, Pageable pageable);

    @Query("{ 'content': { $regex: ?0, $options: 'i' } }")
    Page<Post> searchByContent(String searchTerm, Pageable pageable);

    List<Post> findByIsPrivate(boolean isPrivate);

    List<Post> findByContentContainingIgnoreCase(String content);

    @Query("{ 'createdAt' : { $gte: ?0 } }")
    List<Post> findTrendingPosts(LocalDateTime since, int limit);
}

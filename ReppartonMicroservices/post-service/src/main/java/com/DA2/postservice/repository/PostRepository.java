package com.DA2.postservice.repository;

import com.DA2.postservice.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PostRepository extends MongoRepository<Post, String> {
    
    // Find posts by user
    Page<Post> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    // Find posts by multiple users (for feed)
    Page<Post> findByUserIdInOrderByCreatedAtDesc(List<String> userIds, Pageable pageable);
    
    // Find public posts
    List<Post> findByIsPrivateFalseOrderByCreatedAtDesc();
    Page<Post> findByIsPrivateFalseOrderByCreatedAtDesc(Pageable pageable);
    
    // Find trending posts (most liked in last 7 days)
    @Query(value = "{ 'createdAt': { $gte: ?0 } }", sort = "{ 'likes': -1 }")
    List<Post> findTrendingPosts(LocalDateTime since);
    
    // Count posts by user
    long countByUserId(String userId);
    
    // Find posts with media
    List<Post> findByMediaUrlIsNotNullOrderByCreatedAtDesc();
    
    // Search posts by content
    @Query("{ 'content': { $regex: ?0, $options: 'i' } }")
    Page<Post> searchByContent(String query, Pageable pageable);
}

package com.DA2.postservice.repository;

import com.DA2.postservice.entity.PostLike;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostLikeRepository extends MongoRepository<PostLike, String> {
    
    // Check if user liked a post
    Optional<PostLike> findByPostIdAndUserId(String postId, String userId);
    
    // Find all likes for a post
    List<PostLike> findByPostId(String postId);
    
    // Count likes for a post
    long countByPostId(String postId);
    
    // Find all posts liked by user
    List<PostLike> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Delete all likes for a post
    void deleteByPostId(String postId);
}

package com.DA2.commentservice.repository;

import com.DA2.commentservice.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    
    // Find comments by song
    List<Comment> findBySongIdOrderByCreatedAtDesc(String songId);
    Page<Comment> findBySongIdOrderByCreatedAtDesc(String songId, Pageable pageable);
    
    // Find comments by post
    List<Comment> findByPostIdOrderByCreatedAtDesc(String postId);
    Page<Comment> findByPostIdOrderByCreatedAtDesc(String postId, Pageable pageable);
    
    // Find comments by playlist
    List<Comment> findByPlaylistIdOrderByCreatedAtDesc(String playlistId);
    
    // Find replies
    List<Comment> findByParentIdOrderByCreatedAtAsc(String parentId);
    
    // Find by user
    List<Comment> findByUserIdOrderByCreatedAtDesc(String userId);
    
    // Count comments
    long countBySongId(String songId);
    long countByPostId(String postId);
    long countByPlaylistId(String playlistId);
}

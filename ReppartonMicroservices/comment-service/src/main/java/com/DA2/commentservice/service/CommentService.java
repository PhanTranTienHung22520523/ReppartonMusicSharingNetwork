package com.DA2.commentservice.service;

import com.DA2.commentservice.entity.Comment;
import com.DA2.commentservice.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Transactional
    public Comment createComment(Comment comment) {
        if (comment.getContent() == null || comment.getContent().trim().isEmpty()) {
            throw new RuntimeException("Comment content is required");
        }
        comment.setCreatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    public Optional<Comment> getCommentById(String commentId) {
        return commentRepository.findById(commentId);
    }

    public Page<Comment> getCommentsBySong(String songId, Pageable pageable) {
        return commentRepository.findBySongIdOrderByCreatedAtDesc(songId, pageable);
    }

    public Page<Comment> getCommentsByPost(String postId, Pageable pageable) {
        return commentRepository.findByPostIdOrderByCreatedAtDesc(postId, pageable);
    }

    public List<Comment> getCommentsByPlaylist(String playlistId) {
        return commentRepository.findByPlaylistIdOrderByCreatedAtDesc(playlistId);
    }

    public List<Comment> getReplies(String commentId) {
        return commentRepository.findByParentIdOrderByCreatedAtAsc(commentId);
    }

    @Transactional
    public Comment updateComment(String commentId, String userId, String newContent) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        comment.setContent(newContent);
        comment.setUpdatedAt(LocalDateTime.now());
        return commentRepository.save(comment);
    }

    @Transactional
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        commentRepository.deleteById(commentId);
    }

    public long getCommentCount(String itemId, String type) {
        switch (type) {
            case "song": return commentRepository.countBySongId(itemId);
            case "post": return commentRepository.countByPostId(itemId);
            case "playlist": return commentRepository.countByPlaylistId(itemId);
            default: return 0;
        }
    }
}

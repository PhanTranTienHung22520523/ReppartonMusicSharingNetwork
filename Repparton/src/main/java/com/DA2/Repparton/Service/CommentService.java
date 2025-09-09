package com.DA2.Repparton.Service;

import com.DA2.Repparton.DTO.CommentDTO;
import com.DA2.Repparton.Entity.Comment;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.CommentRepo;
import com.DA2.Repparton.Repository.SongRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CommentService {

    @Autowired
    private CommentRepo commentRepository;

    @Autowired
    private SongRepo songRepository;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Comment createSongComment(String userId, String songId, String parentId, String content) {
        // Validate user and song exist
        userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        songRepository.findById(songId).orElseThrow(() -> new RuntimeException("Song not found"));

        // Sử dụng constructor có tham số thay vì builder
        Comment comment;
        if (parentId != null) {
            comment = new Comment(userId, songId, null, parentId, content);
        } else {
            comment = new Comment(userId, songId, content);
        }

        Comment savedComment = commentRepository.save(comment);

        // Send notification to song owner (if not self-comment)
        // This would need song owner ID from song entity

        return savedComment;
    }

    @Transactional
    public Comment createPostComment(String userId, String postId, String parentId, String content) {
        // Validate user and post exist
        userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        // postRepository.findById(postId).orElseThrow(() -> new RuntimeException("Post not found"));

        // Sử dụng constructor có tham số thay vì builder
        Comment comment;
        if (parentId != null) {
            comment = new Comment(userId, null, postId, parentId, content);
        } else {
            comment = new Comment(userId, postId, content, true);
        }

        Comment savedComment = commentRepository.save(comment);

        // Send notification to post owner (if not self-comment)
        // This would need post owner ID from post entity

        return savedComment;
    }

    @Transactional
    public Comment createPlaylistComment(String userId, String playlistId, String parentId, String content) {
        // Validate user exists
        userRepo.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        // Note: We should validate playlist exists but for now we'll trust it

        // Create comment
        Comment comment;
        if (parentId != null) {
            comment = new Comment();
            comment.setUserId(userId);
            comment.setPlaylistId(playlistId);
            comment.setParentId(parentId);
            comment.setContent(content);
            comment.setCreatedAt(LocalDateTime.now());
        } else {
            comment = new Comment(userId, playlistId, content, "playlist");
        }

        Comment savedComment = commentRepository.save(comment);

        // Send notification to playlist owner (if not self-comment)
        // This would need playlist owner ID from playlist entity

        return savedComment;
    }

    public List<CommentDTO> getCommentsBySong(String songId) {
        List<Comment> comments = commentRepository.findBySongIdAndParentIdIsNull(songId);
        return comments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CommentDTO> getCommentsByPost(String postId) {
        List<Comment> comments = commentRepository.findByPostIdAndParentIdIsNull(postId);
        return comments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CommentDTO> getCommentsByPlaylist(String playlistId) {
        List<Comment> comments = commentRepository.findByPlaylistIdAndParentIdIsNull(playlistId);
        return comments.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    public List<CommentDTO> getReplies(String parentId) {
        List<Comment> replies = commentRepository.findByParentId(parentId);
        return replies.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(String commentId, String userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        // Verify ownership
        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this comment");
        }

        // Delete replies first - sử dụng method có sẵn trong repo
        List<Comment> replies = commentRepository.findByParentId(commentId);
        commentRepository.deleteAll(replies);

        // Delete the comment
        commentRepository.delete(comment);
    }

    private CommentDTO convertToDTO(Comment comment) {
        Optional<User> user = userRepo.findById(comment.getUserId());
        String username = user.map(User::getUsername).orElse("Unknown User");
        String userAvatar = user.map(User::getAvatarUrl).orElse(null);

        return new CommentDTO(
                comment.getId(),
                comment.getUserId(),
                username,
                userAvatar,
                comment.getSongId(),
                comment.getPostId(),
                comment.getPlaylistId(),
                comment.getParentId(),
                comment.getContent(),
                comment.getCreatedAt()
        );
    }

    public Comment getCommentById(String commentId) {
        return commentRepository.findById(commentId).orElse(null);
    }
}

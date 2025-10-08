package com.DA2.postservice.service;

import com.DA2.postservice.entity.Post;
import com.DA2.postservice.entity.PostLike;
import com.DA2.postservice.repository.PostRepository;
import com.DA2.postservice.repository.PostLikeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    // Create post
    @Transactional
    public Post createPost(Post post) {
        if (post.getContent() == null || post.getContent().trim().isEmpty()) {
            throw new RuntimeException("Post content cannot be empty");
        }
        post.setCreatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // Get post by ID
    public Optional<Post> getPostById(String postId) {
        return postRepository.findById(postId);
    }

    // Get posts by user
    public Page<Post> getPostsByUser(String userId, Pageable pageable) {
        return postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    // Get feed (posts from followed users)
    public Page<Post> getFeed(List<String> userIds, Pageable pageable) {
        return postRepository.findByUserIdInOrderByCreatedAtDesc(userIds, pageable);
    }

    // Get public posts
    public Page<Post> getPublicPosts(Pageable pageable) {
        return postRepository.findByIsPrivateFalseOrderByCreatedAtDesc(pageable);
    }

    // Get trending posts
    public List<Post> getTrendingPosts(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return postRepository.findTrendingPosts(since);
    }

    // Update post
    @Transactional
    public Post updatePost(String postId, String userId, String newContent) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this post");
        }

        post.setContent(newContent);
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    // Delete post
    @Transactional
    public void deletePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        // Delete all likes for this post
        postLikeRepository.deleteByPostId(postId);
        
        postRepository.deleteById(postId);
    }

    // Like post
    @Transactional
    public void likePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check if already liked
        Optional<PostLike> existingLike = postLikeRepository.findByPostIdAndUserId(postId, userId);
        if (existingLike.isPresent()) {
            throw new RuntimeException("Post already liked");
        }

        // Create like
        PostLike like = new PostLike(postId, userId);
        postLikeRepository.save(like);

        // Increment likes count
        post.incrementLikes();
        postRepository.save(post);
    }

    // Unlike post
    @Transactional
    public void unlikePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        PostLike like = postLikeRepository.findByPostIdAndUserId(postId, userId)
                .orElseThrow(() -> new RuntimeException("Post not liked yet"));

        postLikeRepository.delete(like);

        // Decrement likes count
        post.decrementLikes();
        postRepository.save(post);
    }

    // Check if user liked post
    public boolean isPostLikedByUser(String postId, String userId) {
        return postLikeRepository.findByPostIdAndUserId(postId, userId).isPresent();
    }

    // Get post likes
    public List<PostLike> getPostLikes(String postId) {
        return postLikeRepository.findByPostId(postId);
    }

    // Get liked posts by user
    public List<PostLike> getLikedPostsByUser(String userId) {
        return postLikeRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Increment share count
    @Transactional
    public void sharePost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        post.incrementShares();
        postRepository.save(post);
    }

    // Search posts
    public Page<Post> searchPosts(String query, Pageable pageable) {
        return postRepository.searchByContent(query, pageable);
    }

    // Get post statistics
    public PostStatistics getPostStatistics(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        long likesCount = postLikeRepository.countByPostId(postId);
        
        PostStatistics stats = new PostStatistics();
        stats.setPostId(postId);
        stats.setLikes(likesCount);
        stats.setShares(post.getShares());
        stats.setComments(post.getComments());
        
        return stats;
    }

    // Inner class for statistics
    public static class PostStatistics {
        private String postId;
        private long likes;
        private int shares;
        private int comments;

        public String getPostId() { return postId; }
        public void setPostId(String postId) { this.postId = postId; }
        public long getLikes() { return likes; }
        public void setLikes(long likes) { this.likes = likes; }
        public int getShares() { return shares; }
        public void setShares(int shares) { this.shares = shares; }
        public int getComments() { return comments; }
        public void setComments(int comments) { this.comments = comments; }
    }
}

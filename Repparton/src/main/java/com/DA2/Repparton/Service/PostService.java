package com.DA2.Repparton.Service;

import com.DA2.Repparton.DTO.PostDTO;
import com.DA2.Repparton.Entity.Post;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.PostRepo;
import com.DA2.Repparton.Repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    @Autowired
    private PostRepo postRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private FollowService followService;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public PostDTO createPost(String userId, String content, MultipartFile mediaFile) throws IOException {
        // Validate user exists
        userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Validate content
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Post content cannot be empty");
        }

        Post post = new Post();
        post.setUserId(userId);
        post.setContent(content);
        post.setCreatedAt(LocalDateTime.now());

        // Handle media upload if present
        if (mediaFile != null && !mediaFile.isEmpty()) {
            try {
                String mediaUrl = cloudinaryService.uploadFile(mediaFile);
                post.setMediaUrl(mediaUrl);

                // Determine media type based on file type
                String contentType = mediaFile.getContentType();
                if (contentType != null && contentType.startsWith("image/")) {
                    post.setMediaType("image");
                } else if (contentType != null && contentType.startsWith("video/")) {
                    post.setMediaType("video");
                } else {
                    post.setMediaType("other");
                }
            } catch (Exception e) {
                System.out.println("Failed to upload media for post: " + e.getMessage());
                throw new RuntimeException("Failed to upload media", e);
            }
        }

        Post savedPost = postRepository.save(post);

        System.out.println("Created post with ID: " + savedPost.getId());

        return convertToDTO(savedPost);
    }

    @Cacheable(value = "posts", key = "#userId")
    public Page<PostDTO> getPostsByUser(String userId, Pageable pageable) {
        Page<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        List<PostDTO> postDTOs = posts.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(postDTOs, pageable, posts.getTotalElements());
    }

    @Cacheable(value = "posts", key = "'feed_' + #userId")
    public Page<PostDTO> getFeed(String userId, Pageable pageable) {
        // Get user's following list
        List<String> followingIds = followService.getFollowingIds(userId);
        followingIds.add(userId); // Include user's own posts

        Page<Post> posts = postRepository.findByUserIdInOrderByCreatedAtDesc(followingIds, pageable);
        List<PostDTO> postDTOs = posts.getContent().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(postDTOs, pageable, posts.getTotalElements());
    }

    @Cacheable(value = "posts", key = "'public'")
    public Page<PostDTO> getPublicPosts(Pageable pageable) {
        // Sử dụng method có sẵn trong repo: findByIsPrivate(false)
        List<Post> publicPosts = postRepository.findByIsPrivate(false);
        // Convert to page manually
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), publicPosts.size());
        List<Post> pageContent = publicPosts.subList(start, end);

        List<PostDTO> postDTOs = pageContent.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
        return new PageImpl<>(postDTOs, pageable, publicPosts.size());
    }

    @Cacheable(value = "trending")
    public List<PostDTO> getTrendingPosts(int limit) {
        // Sử dụng method có sẵn trong repo
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        List<Post> posts = postRepository.findTrendingPosts(weekAgo, limit);
        return posts.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public PostDTO updatePost(String postId, String userId, String newContent) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Verify ownership
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to update this post");
        }

        post.setContent(newContent);
        post.setUpdatedAt(LocalDateTime.now());

        Post updatedPost = postRepository.save(post);
        System.out.println("Updated post with ID: " + updatedPost.getId());

        return convertToDTO(updatedPost);
    }

    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public void deletePost(String postId, String userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Verify ownership
        if (!post.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized to delete this post");
        }

        // Delete media from Cloudinary if present
        if (post.getMediaUrl() != null && !post.getMediaUrl().isEmpty()) {
            try {
                cloudinaryService.deleteFileByUrl(post.getMediaUrl());
            } catch (Exception e) {
                System.out.println("Failed to delete media from Cloudinary: " + e.getMessage());
            }
        }

        postRepository.delete(post);
        System.out.println("Deleted post with ID: " + postId);
    }

    private PostDTO convertToDTO(Post post) {
        // Get user information
        Optional<User> user = userRepository.findById(post.getUserId());
        String username = user.map(User::getUsername).orElse("Unknown User");
        String userAvatarUrl = user.map(User::getAvatarUrl).orElse(null);

        // Sử dụng constructor thủ công thay vì builder
        PostDTO dto = new PostDTO();
        dto.setId(post.getId());
        dto.setUserId(post.getUserId());
        dto.setUsername(username);
        dto.setUserAvatarUrl(userAvatarUrl);
        dto.setContent(post.getContent());
        dto.setMediaUrl(post.getMediaUrl());
        dto.setMediaType(post.getMediaType());
        dto.setLikeCount(post.getLikes());
        dto.setCommentCount(0); // This would need to be calculated from comments
        dto.setShareCount(post.getShares());
        dto.setCreatedAt(post.getCreatedAt());
        dto.setUpdatedAt(post.getUpdatedAt());

        return dto;
    }
}

package com.DA2.messageservice.service;

import com.DA2.messageservice.entity.ArtistGroup;
import com.DA2.messageservice.entity.GroupPost;
import com.DA2.messageservice.entity.GroupMessage;
import com.DA2.messageservice.repository.ArtistGroupRepository;
import com.DA2.messageservice.repository.GroupPostRepository;
import com.DA2.messageservice.repository.GroupMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ArtistGroupService {
    
    private final ArtistGroupRepository groupRepository;
    private final GroupPostRepository postRepository;
    private final GroupMessageRepository messageRepository;
    
    // ========== GROUP MANAGEMENT ==========
    
    @Transactional
    public ArtistGroup createGroup(String artistId, String artistName, String groupName, String description) {
        ArtistGroup group = new ArtistGroup(artistId, artistName, groupName, description);
        return groupRepository.save(group);
    }
    
    public Optional<ArtistGroup> getGroupById(String groupId) {
        return groupRepository.findByIdAndIsActiveTrue(groupId);
    }
    
    public List<ArtistGroup> getGroupsByArtist(String artistId) {
        return groupRepository.findByArtistIdAndIsActiveTrue(artistId);
    }
    
    public List<ArtistGroup> getGroupsByMember(String userId) {
        return groupRepository.findByMemberIdsContaining(userId);
    }
    
    public List<ArtistGroup> getAllActiveGroups() {
        return groupRepository.findByIsActiveTrue();
    }
    
    @Transactional
    public ArtistGroup updateGroup(String groupId, String artistId, String groupName, String description, String imageUrl) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.isOwner(artistId)) {
            throw new RuntimeException("Only group owner can update group");
        }
        
        if (groupName != null) group.setGroupName(groupName);
        if (description != null) group.setDescription(description);
        if (imageUrl != null) group.setGroupImageUrl(imageUrl);
        group.setUpdatedAt(LocalDateTime.now());
        
        return groupRepository.save(group);
    }
    
    @Transactional
    public void deleteGroup(String groupId, String artistId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.isOwner(artistId)) {
            throw new RuntimeException("Only group owner can delete group");
        }
        
        group.setActive(false);
        group.setUpdatedAt(LocalDateTime.now());
        groupRepository.save(group);
    }
    
    // ========== MEMBER MANAGEMENT ==========
    
    @Transactional
    public ArtistGroup joinGroup(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (group.isMember(userId)) {
            throw new RuntimeException("Already a member");
        }
        
        group.addMember(userId);
        return groupRepository.save(group);
    }
    
    @Transactional
    public ArtistGroup leaveGroup(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (group.isOwner(userId)) {
            throw new RuntimeException("Owner cannot leave group");
        }
        
        group.removeMember(userId);
        return groupRepository.save(group);
    }
    
    @Transactional
    public ArtistGroup inviteToChat(String groupId, String artistId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.isOwner(artistId)) {
            throw new RuntimeException("Only group owner can invite to chat");
        }
        
        if (!group.isMember(userId)) {
            throw new RuntimeException("User is not a member");
        }
        
        group.allowChat(userId);
        return groupRepository.save(group);
    }
    
    @Transactional
    public ArtistGroup revokeChat(String groupId, String artistId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.isOwner(artistId)) {
            throw new RuntimeException("Only group owner can revoke chat");
        }
        
        group.disallowChat(userId);
        return groupRepository.save(group);
    }
    
    // ========== POST MANAGEMENT ==========
    
    @Transactional
    public GroupPost createPost(String groupId, String artistId, String artistName, String content, String mediaUrl, String mediaType) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.isOwner(artistId)) {
            throw new RuntimeException("Only group owner can post");
        }
        
        GroupPost post = new GroupPost(groupId, artistId, artistName, content, mediaUrl, mediaType);
        post = postRepository.save(post);
        
        // Update post count
        group.setPostCount((int) postRepository.countByGroupId(groupId));
        groupRepository.save(group);
        
        return post;
    }
    
    public List<GroupPost> getGroupPosts(String groupId) {
        return postRepository.findByGroupIdOrderByCreatedAtDesc(groupId);
    }
    
    @Transactional
    public void deletePost(String postId, String artistId) {
        Optional<GroupPost> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            throw new RuntimeException("Post not found");
        }
        
        GroupPost post = postOpt.get();
        if (!post.getArtistId().equals(artistId)) {
            throw new RuntimeException("Only post owner can delete");
        }
        
        postRepository.delete(post);
        
        // Update post count
        Optional<ArtistGroup> groupOpt = groupRepository.findById(post.getGroupId());
        if (groupOpt.isPresent()) {
            ArtistGroup group = groupOpt.get();
            group.setPostCount((int) postRepository.countByGroupId(post.getGroupId()));
            groupRepository.save(group);
        }
    }
    
    // ========== CHAT MESSAGE MANAGEMENT ==========
    
    @Transactional
    public GroupMessage sendMessage(String groupId, String userId, String userName, String content) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.canChat(userId)) {
            throw new RuntimeException("You are not allowed to chat in this group");
        }
        
        GroupMessage message = GroupMessage.builder()
                .groupId(groupId)
                .senderId(userId)
                .senderName(userName)
                .content(content)
                .messageType(GroupMessage.MessageType.TEXT)
                .sentAt(LocalDateTime.now())
                .status(GroupMessage.MessageStatus.APPROVED)
                .isDeleted(false)
                .build();
        return messageRepository.save(message);
    }
    
    public List<GroupMessage> getGroupMessages(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new RuntimeException("Group not found");
        }
        
        ArtistGroup group = groupOpt.get();
        if (!group.isMember(userId)) {
            throw new RuntimeException("Not a member");
        }
        
        return messageRepository.findByGroupIdAndIsDeletedFalseOrderBySentAtDesc(groupId);
    }
    
    // ========== PERMISSION CHECKS ==========
    
    public boolean canViewGroup(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        return groupOpt.isPresent();
    }
    
    public boolean canJoinGroup(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) return false;
        return !groupOpt.get().isMember(userId);
    }
    
    public boolean canChat(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) return false;
        return groupOpt.get().canChat(userId);
    }
    
    public boolean isOwner(String groupId, String userId) {
        Optional<ArtistGroup> groupOpt = groupRepository.findById(groupId);
        if (groupOpt.isEmpty()) return false;
        return groupOpt.get().isOwner(userId);
    }
}

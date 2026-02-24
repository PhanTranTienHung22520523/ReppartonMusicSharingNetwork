package com.DA2.messageservice.service;

import com.DA2.messageservice.client.UserServiceClient;
import com.DA2.messageservice.dto.GroupSummaryDTO;
import com.DA2.messageservice.dto.UserDTO;
import com.DA2.messageservice.entity.GroupConversation;
import com.DA2.messageservice.entity.GroupMessage;
import com.DA2.messageservice.repository.GroupConversationRepository;
import com.DA2.messageservice.repository.GroupMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final GroupConversationRepository groupConversationRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final PermissionService permissionService;
    private final UserServiceClient userServiceClient;

    private final Map<String, UserDTO> creatorCache = new ConcurrentHashMap<>();

    public List<GroupSummaryDTO> getPublicGroups(String query, String requesterUserId) {
        List<GroupConversation> groups;
        if (query == null || query.trim().isEmpty()) {
            // Use findAll + in-memory filter for better compatibility with legacy Mongo schemas
            groups = new ArrayList<>();
            for (GroupConversation g : groupConversationRepository.findAll()) {
                if (!g.isPrivate()) {
                    groups.add(g);
                }
            }
        } else {
            groups = groupConversationRepository.findByNameContaining(query.trim());
        }

        List<GroupSummaryDTO> result = new ArrayList<>();
        for (GroupConversation group : groups) {
            result.add(toSummary(group, requesterUserId));
        }
        return result;
    }

    public List<GroupSummaryDTO> getUserGroupSummaries(String userId) {
        List<GroupConversation> groups = groupConversationRepository.findByMemberId(userId);
        List<GroupSummaryDTO> result = new ArrayList<>();
        for (GroupConversation group : groups) {
            result.add(toSummary(group, userId));
        }
        return result;
    }

    public GroupSummaryDTO getGroupSummaryById(String groupId, String requesterUserId) {
        GroupConversation group = groupConversationRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));
        return toSummary(group, requesterUserId);
    }

    private GroupSummaryDTO toSummary(GroupConversation group, String requesterUserId) {
        GroupSummaryDTO dto = new GroupSummaryDTO();
        dto.setId(group.getId());
        dto.setGroupName(group.getName());
        dto.setDescription(group.getDescription());
        dto.setGroupImageUrl(group.getAvatarUrl());
        dto.setCreatedBy(group.getCreatedBy());
        dto.setPrivate(group.isPrivate());

        int memberCount = 0;
        if (group.getParticipantIds() != null && !group.getParticipantIds().isEmpty()) {
            memberCount = group.getParticipantIds().size();
        } else if (group.getMemberIds() != null) {
            memberCount = group.getMemberIds().size();
        }
        dto.setMemberCount(memberCount);

        dto.setLastMessage(group.getLastMessage());
        Instant lastTime = group.getLastMessageTime();
        if (lastTime == null && group.getLastMessageAt() != null) {
            lastTime = group.getLastMessageAt().atZone(ZoneId.systemDefault()).toInstant();
        }
        dto.setLastMessageTime(lastTime);
        dto.setMessageCount(group.getMessageCount() != null ? group.getMessageCount() : 0L);

        if (requesterUserId != null && !requesterUserId.isEmpty()) {
            dto.setMember(group.isMember(requesterUserId));
            dto.setCanSendMessages(group.canUserSendMessage(requesterUserId));

            boolean unread = false;
            long unreadCount = 0L;
            if (group.isMember(requesterUserId) && lastTime != null) {
                Instant lastReadAt = group.getMemberLastReadAt(requesterUserId);
                // If we have no read marker (legacy participants), treat as unread when there is at least one message.
                if (lastReadAt == null) {
                    unread = (group.getMessageCount() != null ? group.getMessageCount() : 0L) > 0L;
                } else {
                    unread = lastTime.isAfter(lastReadAt);
                }
            }
            if (unread) {
                unreadCount = 1L;
            }
            dto.setUnread(unread);
            dto.setUnreadCount(unreadCount);
        }

        String createdBy = group.getCreatedBy();
        if (createdBy != null && !createdBy.isEmpty()) {
            try {
                UserDTO creator = creatorCache.computeIfAbsent(createdBy, id -> {
                    try {
                        return userServiceClient.getUserById(id);
                    } catch (Exception ex) {
                        return null;
                    }
                });

                if (creator != null) {
                    dto.setCreatorRole(creator.getRole());
                    dto.setCreatorAvatar(creator.getAvatar());
                    String name = creator.getFullName();
                    if (name == null || name.isBlank()) {
                        name = creator.getUsername();
                    }
                    dto.setCreatorName(name);
                }
            } catch (Exception e) {
                // ignore creator enrichment errors
            }
        }

        String role = dto.getCreatorRole();
        if (role != null && role.equalsIgnoreCase("ARTIST")) {
            dto.setGroupType("ARTIST");
        } else {
            dto.setGroupType("NORMAL");
        }

        return dto;
    }

    @Transactional
    public GroupConversation joinGroup(String groupId, String userId) {
        GroupConversation group = groupConversationRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (group.isMember(userId)) {
            return group;
        }

        // Self-join allowed for public groups. For private groups, we add as MEMBER (approval can be extended later).
        boolean canSend = group.isAllowAllMembersChat();
        group.addMember(userId, GroupConversation.GroupMember.GroupMemberRole.MEMBER, canSend);
        group.setUpdatedAt(LocalDateTime.now());
        return groupConversationRepository.save(group);
    }

    @Transactional
    public GroupConversation leaveGroup(String groupId, String userId) {
        GroupConversation group = groupConversationRepository.findById(groupId)
                .orElseThrow(() -> new IllegalArgumentException("Group not found"));

        if (userId != null && userId.equals(group.getCreatedBy())) {
            throw new IllegalArgumentException("Owner cannot leave group");
        }

        group.removeMember(userId);
        group.setUpdatedAt(LocalDateTime.now());
        return groupConversationRepository.save(group);
    }

    /**
     * Create a new group conversation
     */
    @Transactional
    public GroupConversation createGroup(
            String name,
            String description,
            String createdBy,
            List<String> initialMembers,
            Boolean allowAllMembersChat,
            List<String> allowedChatMemberIds
    ) {
        boolean allowAll = allowAllMembersChat == null || allowAllMembersChat;
        Set<String> allowed = new HashSet<>();
        if (!allowAll) {
            if (allowedChatMemberIds != null) {
                allowed.addAll(allowedChatMemberIds);
            }
            // If not provided, treat invited members as the selected chatters.
            if ((allowedChatMemberIds == null || allowedChatMemberIds.isEmpty()) && initialMembers != null) {
                allowed.addAll(initialMembers);
            }
        }

        GroupConversation group = GroupConversation.builder()
                .name(name)
                .description(description)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .allowAllMembersChat(allowAll)
                .messageCount(0L)
                .build();

        // Add creator as owner
        group.addMember(createdBy, GroupConversation.GroupMember.GroupMemberRole.OWNER, true);

        // Add initial members
        if (initialMembers != null) {
            for (String memberId : initialMembers) {
                if (!memberId.equals(createdBy)) {
                    boolean canSend = allowAll || allowed.contains(memberId);
                    group.addMember(memberId, GroupConversation.GroupMember.GroupMemberRole.MEMBER, canSend);
                }
            }
        }

        GroupConversation savedGroup = groupConversationRepository.save(group);
        log.info("Created new group conversation: {} with ID: {}", name, savedGroup.getId());
        return savedGroup;
    }

    /**
     * Add member to group
     */
    @Transactional
    public boolean addMember(String groupId, String userId, String addedBy) {
        Optional<GroupConversation> groupOpt = groupConversationRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }

        GroupConversation group = groupOpt.get();

        // Check if adder has permission
        if (!permissionService.canInviteMembers(addedBy, groupId)) {
            log.warn("User {} does not have permission to add members to group {}", addedBy, groupId);
            return false;
        }

        if (group.isMember(userId)) {
            return true; // Already a member
        }

        boolean canSend = group.isAllowAllMembersChat();
        group.addMember(userId, GroupConversation.GroupMember.GroupMemberRole.MEMBER, canSend);
        group.setUpdatedAt(LocalDateTime.now());
        groupConversationRepository.save(group);

        log.info("Added user {} to group {} by {}", userId, groupId, addedBy);
        return true;
    }

    /**
     * Remove member from group
     */
    @Transactional
    public boolean removeMember(String groupId, String userId, String removedBy) {
        Optional<GroupConversation> groupOpt = groupConversationRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }

        GroupConversation group = groupOpt.get();

        // Check if remover has permission
        if (!permissionService.canRemoveMember(removedBy, groupId, userId)) {
            log.warn("User {} does not have permission to remove user {} from group {}", removedBy, userId, groupId);
            return false;
        }

        group.removeMember(userId);
        group.setUpdatedAt(LocalDateTime.now());
        groupConversationRepository.save(group);

        log.info("Removed user {} from group {} by {}", userId, groupId, removedBy);
        return true;
    }

    /**
     * Send message to group
     */
    @Transactional
    public GroupMessage sendMessage(String groupId, String senderId, String content, GroupMessage.MessageType messageType) {
        Optional<GroupConversation> groupOpt = groupConversationRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new IllegalArgumentException("Group not found");
        }

        GroupConversation group = groupOpt.get();

        // Check if sender is a member
        if (!group.isMember(senderId)) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        // Enforce per-member chat permissions
        if (!group.canUserSendMessage(senderId)) {
            throw new IllegalArgumentException("User does not have permission to send messages in this group");
        }

        GroupMessage.MessageStatus initialStatus = GroupMessage.MessageStatus.APPROVED;

        // Check if message needs approval
        if (group.getMessageApprovalType() != GroupConversation.MessageApprovalType.NONE) {
            if (!permissionService.canSendMessage(senderId, groupId)) {
                initialStatus = GroupMessage.MessageStatus.PENDING;
            }
        }

        GroupMessage message = GroupMessage.builder()
                .groupConversationId(groupId)
                .senderId(senderId)
                .content(content)
                .messageType(messageType)
                .sentAt(LocalDateTime.now())
                .status(initialStatus)
                .build();

        GroupMessage savedMessage = groupMessageRepository.save(message);

        // Update group's last message fields for list previews
        group.setLastMessage(content);
        group.setLastMessageTime(Instant.now());
        group.setLastMessageAt(LocalDateTime.now());
        long nextCount = group.getMessageCount() != null ? group.getMessageCount() + 1 : 1L;
        group.setMessageCount(nextCount);
        groupConversationRepository.save(group);

        log.info("Message sent to group {} by user {} with status {}", groupId, senderId, initialStatus);
        return savedMessage;
    }

    /**
     * Approve or reject pending message
     */
    @Transactional
    public boolean approveMessage(String messageId, String approverId, boolean approve, String note) {
        Optional<GroupMessage> messageOpt = groupMessageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return false;
        }

        GroupMessage message = messageOpt.get();

        // Check if approver has permission
        if (!permissionService.canApproveMessages(approverId, message.getGroupConversationId())) {
            log.warn("User {} does not have permission to approve messages in group {}",
                    approverId, message.getGroupConversationId());
            return false;
        }

        if (approve) {
            message.approve(approverId);
        } else {
            message.reject(approverId, note);
        }

        groupMessageRepository.save(message);
        log.info("Message {} {} by user {}", messageId, approve ? "approved" : "rejected", approverId);
        return true;
    }

    /**
     * Get approved messages for a group
     */
    public List<GroupMessage> getMessages(String groupId, String userId, int page, int size) {
        Optional<GroupConversation> groupOpt = groupConversationRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            throw new IllegalArgumentException("Group not found");
        }

        GroupConversation group = groupOpt.get();

        // Check if user is a member
        if (!group.isMember(userId)) {
            throw new IllegalArgumentException("User is not a member of this group");
        }

        // Mark as read
        group.setMemberLastReadAt(userId, Instant.now());
        groupConversationRepository.save(group);

        Pageable pageable = PageRequest.of(page, size);
        return groupMessageRepository.findByGroupConversationIdOrderBySentAtDesc(groupId, pageable);
    }

    /**
     * Update chat permissions for a group (owner/admin).
     * - allowAllMembersChat=true: all current members can chat
     * - allowAllMembersChat=false: only allowedChatMemberIds (plus owner) can chat
     */
    @Transactional
    public boolean updateChatPermissions(String groupId, String requesterUserId, boolean allowAllMembersChat, List<String> allowedChatMemberIds) {
        Optional<GroupConversation> groupOpt = groupConversationRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }
        GroupConversation group = groupOpt.get();

        if (!permissionService.canManageGroup(requesterUserId, groupId)) {
            return false;
        }

        group.setAllowAllMembersChat(allowAllMembersChat);

        Set<String> allowed = new HashSet<>();
        if (!allowAllMembersChat && allowedChatMemberIds != null) {
            allowed.addAll(allowedChatMemberIds);
        }

        for (GroupConversation.GroupMember m : group.getMembers()) {
            if (m == null || m.getUserId() == null) continue;
            if (m.getRole() == GroupConversation.GroupMember.GroupMemberRole.OWNER) {
                m.setCanSendMessages(true);
                continue;
            }
            if (allowAllMembersChat) {
                m.setCanSendMessages(true);
            } else {
                m.setCanSendMessages(allowed.contains(m.getUserId()));
            }
        }

        group.setUpdatedAt(LocalDateTime.now());
        groupConversationRepository.save(group);
        return true;
    }

    /**
     * Pinned groups for an artist profile: groups created by that user where creator role == ARTIST.
     */
    public List<GroupSummaryDTO> getPinnedGroupsForProfile(String profileUserId, String requesterUserId) {
        if (profileUserId == null || profileUserId.isBlank()) {
            return Collections.emptyList();
        }

        List<GroupConversation> groups = groupConversationRepository.findByCreatedBy(profileUserId);
        if (groups == null || groups.isEmpty()) {
            return Collections.emptyList();
        }

        List<GroupSummaryDTO> result = new ArrayList<>();
        for (GroupConversation g : groups) {
            GroupSummaryDTO dto = toSummary(g, requesterUserId);
            if ("ARTIST".equalsIgnoreCase(dto.getGroupType())) {
                result.add(dto);
            }
        }
        return result;
    }

    /**
     * Get pending messages for approval
     */
    public List<GroupMessage> getPendingMessages(String groupId, String userId) {
        // Check if user can approve messages
        if (!permissionService.canApproveMessages(userId, groupId)) {
            throw new IllegalArgumentException("User does not have permission to view pending messages");
        }

        return groupMessageRepository.findPendingMessagesByGroupId(groupId);
    }

    /**
     * Get user's groups
     */
    public List<GroupConversation> getUserGroups(String userId) {
        return groupConversationRepository.findByMemberId(userId);
    }

    /**
     * Update group settings
     */
    @Transactional
    public boolean updateGroupSettings(String groupId, String userId, String name, String description,
                                     GroupConversation.MessageApprovalType approvalType, boolean isPrivate) {
        Optional<GroupConversation> groupOpt = groupConversationRepository.findById(groupId);
        if (groupOpt.isEmpty()) {
            return false;
        }

        GroupConversation group = groupOpt.get();

        // Check if user can edit settings
        if (!permissionService.canEditGroupSettings(userId, groupId)) {
            log.warn("User {} does not have permission to edit group {} settings", userId, groupId);
            return false;
        }

        group.setName(name);
        group.setDescription(description);
        group.setMessageApprovalType(approvalType);
        group.setPrivate(isPrivate);
        group.setUpdatedAt(LocalDateTime.now());

        groupConversationRepository.save(group);
        log.info("Group {} settings updated by user {}", groupId, userId);
        return true;
    }

    /**
     * Delete message
     */
    @Transactional
    public boolean deleteMessage(String messageId, String userId) {
        Optional<GroupMessage> messageOpt = groupMessageRepository.findById(messageId);
        if (messageOpt.isEmpty()) {
            return false;
        }

        GroupMessage message = messageOpt.get();

        // Check if user can delete this message
        if (!permissionService.canDeleteMessage(userId, message.getGroupConversationId(), message.getSenderId())) {
            log.warn("User {} does not have permission to delete message {}", userId, messageId);
            return false;
        }

        message.delete();
        groupMessageRepository.save(message);
        log.info("Message {} deleted by user {}", messageId, userId);
        return true;
    }
}
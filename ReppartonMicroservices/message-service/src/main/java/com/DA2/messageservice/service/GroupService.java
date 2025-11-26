package com.DA2.messageservice.service;

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

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupService {

    private final GroupConversationRepository groupConversationRepository;
    private final GroupMessageRepository groupMessageRepository;
    private final PermissionService permissionService;

    /**
     * Create a new group conversation
     */
    @Transactional
    public GroupConversation createGroup(String name, String description, String createdBy, List<String> initialMembers) {
        GroupConversation group = GroupConversation.builder()
                .name(name)
                .description(description)
                .createdBy(createdBy)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        // Add creator as owner
        group.addMember(createdBy, GroupConversation.GroupMember.GroupMemberRole.OWNER);

        // Add initial members
        if (initialMembers != null) {
            for (String memberId : initialMembers) {
                if (!memberId.equals(createdBy)) {
                    group.addMember(memberId, GroupConversation.GroupMember.GroupMemberRole.MEMBER);
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

        group.addMember(userId, GroupConversation.GroupMember.GroupMemberRole.MEMBER);
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

        // Update group's last message time
        group.setLastMessageAt(LocalDateTime.now());
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

        Pageable pageable = PageRequest.of(page, size);
        return groupMessageRepository.findByGroupConversationIdOrderBySentAtDesc(groupId, pageable);
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
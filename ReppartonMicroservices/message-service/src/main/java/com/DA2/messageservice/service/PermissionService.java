package com.DA2.messageservice.service;

import com.DA2.messageservice.entity.GroupConversation;
import com.DA2.messageservice.entity.GroupMessage;
import com.DA2.messageservice.repository.GroupConversationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionService {

    private final GroupConversationRepository groupConversationRepository;

    /**
     * Check if user can send messages in the group
     */
    public boolean canSendMessage(String userId, String groupId) {
        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            log.warn("Group not found: {}", groupId);
            return false;
        }

        return group.canUserSendMessage(userId);
    }

    /**
     * Check if user can approve/reject messages in the group
     */
    public boolean canApproveMessages(String userId, String groupId) {
        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            log.warn("Group not found: {}", groupId);
            return false;
        }

        return group.canUserApproveMessages(userId);
    }

    /**
     * Check if user is admin (owner or admin) of the group
     */
    public boolean isAdmin(String userId, String groupId) {
        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            log.warn("Group not found: {}", groupId);
            return false;
        }

        return group.isUserAdmin(userId);
    }

    /**
     * Check if user can manage group (add/remove members, change settings)
     */
    public boolean canManageGroup(String userId, String groupId) {
        return isAdmin(userId, groupId);
    }

    /**
     * Check if user can delete messages in the group
     */
    public boolean canDeleteMessage(String userId, String groupId, String messageSenderId) {
        // User can delete their own messages
        if (userId.equals(messageSenderId)) {
            return true;
        }

        // Admins can delete any message
        return isAdmin(userId, groupId);
    }

    /**
     * Check if user can edit group settings
     */
    public boolean canEditGroupSettings(String userId, String groupId) {
        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            return false;
        }

        // Only creator (owner) can edit group settings
        return group.getCreatedBy().equals(userId);
    }

    /**
     * Check if user can invite members to the group
     */
    public boolean canInviteMembers(String userId, String groupId) {
        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            return false;
        }

        // For private groups, only admins can invite
        if (group.isPrivate()) {
            return isAdmin(userId, groupId);
        }

        // For public groups, any member can invite
        return group.isMember(userId);
    }

    /**
     * Check if user can remove members from the group
     */
    public boolean canRemoveMember(String userId, String groupId, String targetUserId) {
        // Can't remove yourself
        if (userId.equals(targetUserId)) {
            return false;
        }

        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            return false;
        }

        // Only admins can remove members
        return isAdmin(userId, groupId);
    }

    /**
     * Check if user can change member roles
     */
    public boolean canChangeMemberRole(String userId, String groupId, String targetUserId) {
        // Can't change your own role
        if (userId.equals(targetUserId)) {
            return false;
        }

        GroupConversation group = groupConversationRepository.findById(groupId).orElse(null);
        if (group == null) {
            return false;
        }

        // Only owner can change roles
        return group.getCreatedBy().equals(userId);
    }

    /**
     * Validate message status transition
     */
    public boolean canChangeMessageStatus(String userId, String groupId, GroupMessage.MessageStatus newStatus) {
        if (newStatus == GroupMessage.MessageStatus.PENDING) {
            // Anyone can create pending messages
            return true;
        }

        // Only approvers can change status to approved/rejected
        return canApproveMessages(userId, groupId);
    }
}
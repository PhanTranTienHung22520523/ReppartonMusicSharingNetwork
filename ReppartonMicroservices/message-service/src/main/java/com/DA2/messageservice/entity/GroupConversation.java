package com.DA2.messageservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "groupConversations")
public class GroupConversation {
    @Id
    private String id;
    private String name;
    @Field("groupName")
    private String legacyGroupName;
    private String description;
    private String avatarUrl;
    @Field("groupImageUrl")
    private String legacyGroupImageUrl;
    private String createdBy; // User ID who created the group

    // Legacy/Atlas schema compatibility
    @Field("participants")
    @Builder.Default
    private List<String> participantIds = new java.util.ArrayList<>();

    private String lastMessage;
    private Instant lastMessageTime;
    private Long messageCount;
    @Builder.Default
    private List<String> memberIds = new java.util.ArrayList<>();
    @Builder.Default
    private List<GroupMember> members = new java.util.ArrayList<>();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastMessageAt;

    // Group settings
    @Builder.Default
    private boolean isPrivate = false;
    @Builder.Default
    private MessageApprovalType messageApprovalType = MessageApprovalType.NONE;

    // Chat permissions
    // - true: all members can chat (subject to messageApprovalType)
    // - false: only selected members can chat (creator/owner can always chat)
    @Builder.Default
    private boolean allowAllMembersChat = true;

    public String getName() {
        if (name != null && !name.isBlank()) {
            return name;
        }
        return legacyGroupName;
    }

    public String getAvatarUrl() {
        if (avatarUrl != null && !avatarUrl.isBlank()) {
            return avatarUrl;
        }
        return legacyGroupImageUrl;
    }

    public enum MessageApprovalType {
        NONE,        // No approval needed
        ADMIN_ONLY,  // Only admins can send messages
        MODERATOR    // Admins and moderators can send messages
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GroupMember {
        private String userId;
        private GroupMemberRole role;
        @Builder.Default
        private boolean isApproved = true; // For private groups
        @Builder.Default
        private boolean canSendMessages = true;
        @Builder.Default
        private Instant lastReadAt = null;
        private LocalDateTime joinedAt;

        public enum GroupMemberRole {
            OWNER,      // Can do everything
            ADMIN,      // Can manage members and approve messages
            MODERATOR,  // Can approve messages and moderate
            MEMBER      // Regular member
        }
    }

    public void addMember(String userId, GroupMember.GroupMemberRole role) {
        addMember(userId, role, true);
    }

    public void addMember(String userId, GroupMember.GroupMemberRole role, boolean canSendMessages) {
        if (userId == null || userId.isBlank()) {
            return;
        }

        if (!memberIds.contains(userId)) {
            memberIds.add(userId);
        }
        if (!participantIds.contains(userId)) {
            participantIds.add(userId);
        }

        GroupMember existing = members.stream()
                .filter(m -> Objects.equals(m.getUserId(), userId))
                .findFirst()
                .orElse(null);

        if (existing == null) {
            GroupMember member = GroupMember.builder()
                    .userId(userId)
                    .role(role)
                    .canSendMessages(canSendMessages)
                    .joinedAt(LocalDateTime.now())
                    .build();
            members.add(member);
        } else {
            existing.setRole(role);
            existing.setCanSendMessages(canSendMessages);
            if (existing.getJoinedAt() == null) {
                existing.setJoinedAt(LocalDateTime.now());
            }
        }
    }

    public void removeMember(String userId) {
        memberIds.remove(userId);
        participantIds.remove(userId);
        members.removeIf(member -> member.getUserId().equals(userId));
    }

    public boolean isMember(String userId) {
        return memberIds.contains(userId) || participantIds.contains(userId);
    }

    public boolean canUserSendMessage(String userId) {
        GroupMember member = members.stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        if (member == null) {
            // Legacy groups may only have participantIds/memberIds without a members[] entry.
            // Treat them as allowed (subject to group-level approvals) if they are a member.
            if (!isMember(userId)) {
                return false;
            }
            // In "selected members" mode we need an explicit members[] record.
            if (!allowAllMembersChat) {
                return Objects.equals(createdBy, userId);
            }
            // allowAllMembersChat=true: proceed with group-level approval rules
            switch (messageApprovalType) {
                case NONE:
                    return true;
                case MODERATOR:
                case ADMIN_ONLY:
                default:
                    // Without a member record we can't know role; default deny for stricter modes.
                    return false;
            }
        }

        // Creator/owner can always chat.
        if (member.getRole() == GroupMember.GroupMemberRole.OWNER) {
            return true;
        }

        // If group is in selected-members mode, check individual allowlist flag.
        if (!allowAllMembersChat && !member.isCanSendMessages()) {
            return false;
        }

        // Check individual permission first
        if (!member.isCanSendMessages()) {
            return false;
        }

        // Check group-level permissions
        switch (messageApprovalType) {
            case NONE:
                return true;
            case MODERATOR:
                return member.getRole() == GroupMember.GroupMemberRole.OWNER ||
                       member.getRole() == GroupMember.GroupMemberRole.ADMIN ||
                       member.getRole() == GroupMember.GroupMemberRole.MODERATOR;
            case ADMIN_ONLY:
                return member.getRole() == GroupMember.GroupMemberRole.OWNER ||
                       member.getRole() == GroupMember.GroupMemberRole.ADMIN;
            default:
                return false;
        }
    }

    public Instant getMemberLastReadAt(String userId) {
        GroupMember member = members.stream()
                .filter(m -> Objects.equals(m.getUserId(), userId))
                .findFirst()
                .orElse(null);
        return member != null ? member.getLastReadAt() : null;
    }

    public void setMemberLastReadAt(String userId, Instant when) {
        GroupMember member = members.stream()
                .filter(m -> Objects.equals(m.getUserId(), userId))
                .findFirst()
                .orElse(null);
        if (member != null) {
            member.setLastReadAt(when);
        }
    }

    public boolean canUserApproveMessages(String userId) {
        GroupMember member = members.stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        if (member == null) {
            return false;
        }

        return member.getRole() == GroupMember.GroupMemberRole.OWNER ||
               member.getRole() == GroupMember.GroupMemberRole.ADMIN ||
               member.getRole() == GroupMember.GroupMemberRole.MODERATOR;
    }

    public boolean isUserAdmin(String userId) {
        GroupMember member = members.stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        if (member == null) {
            return false;
        }

        return member.getRole() == GroupMember.GroupMemberRole.OWNER ||
               member.getRole() == GroupMember.GroupMemberRole.ADMIN;
    }
}
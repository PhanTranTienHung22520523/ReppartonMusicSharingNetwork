package com.DA2.messageservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "group_conversations")
public class GroupConversation {
    @Id
    private String id;
    private String name;
    private String description;
    private String avatarUrl;
    private String createdBy; // User ID who created the group
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
        private LocalDateTime joinedAt;

        public enum GroupMemberRole {
            OWNER,      // Can do everything
            ADMIN,      // Can manage members and approve messages
            MODERATOR,  // Can approve messages and moderate
            MEMBER      // Regular member
        }
    }

    public void addMember(String userId, GroupMember.GroupMemberRole role) {
        if (!memberIds.contains(userId)) {
            memberIds.add(userId);
            GroupMember member = GroupMember.builder()
                    .userId(userId)
                    .role(role)
                    .joinedAt(LocalDateTime.now())
                    .build();
            members.add(member);
        }
    }

    public void removeMember(String userId) {
        memberIds.remove(userId);
        members.removeIf(member -> member.getUserId().equals(userId));
    }

    public boolean isMember(String userId) {
        return memberIds.contains(userId);
    }

    public boolean canUserSendMessage(String userId) {
        GroupMember member = members.stream()
                .filter(m -> m.getUserId().equals(userId))
                .findFirst()
                .orElse(null);

        if (member == null) {
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
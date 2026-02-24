package com.DA2.messageservice.controller;

import com.DA2.messageservice.dto.GroupSummaryDTO;
import com.DA2.messageservice.entity.GroupConversation;
import com.DA2.messageservice.entity.GroupMessage;
import com.DA2.messageservice.service.GroupService;
import com.DA2.messageservice.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;
    private final PermissionService permissionService;

    /**
     * Create a new group conversation
     */
    @PostMapping
    public ResponseEntity<GroupConversation> createGroup(
            @RequestBody CreateGroupRequest request,
            @RequestHeader("X-User-Id") String userId) {

        GroupConversation group = groupService.createGroup(
                request.getName(),
                request.getDescription(),
                userId,
            request.getInitialMembers(),
            request.getAllowAllMembersChat(),
            request.getAllowedChatMemberIds()
        );

        return ResponseEntity.ok(group);
    }

    /**
     * Get user's groups
     */
    @GetMapping
    public ResponseEntity<?> getUserGroups(@RequestHeader("X-User-Id") String userId) {
        List<GroupSummaryDTO> groups = groupService.getUserGroupSummaries(userId);
        return ResponseEntity.ok(Map.of("success", true, "data", groups));
    }

    /**
     * Public browse groups (by GroupConversation.name). Optional search by query param q.
     */
    @GetMapping("/public")
    public ResponseEntity<?> browsePublicGroups(
            @RequestParam(name = "q", required = false) String q,
            @RequestHeader(value = "X-User-Id", required = false) String requesterUserId) {
        List<GroupSummaryDTO> groups = groupService.getPublicGroups(q, requesterUserId);
        return ResponseEntity.ok(Map.of("success", true, "data", groups));
    }

    /**
     * Public group summary (does not require membership).
     */
    @GetMapping("/public/{groupId}")
    public ResponseEntity<?> getPublicGroupSummary(
            @PathVariable("groupId") String groupId,
            @RequestHeader(value = "X-User-Id", required = false) String requesterUserId) {
        GroupSummaryDTO group = groupService.getGroupSummaryById(groupId, requesterUserId);
        return ResponseEntity.ok(Map.of("success", true, "data", group));
    }

    /**
     * Pinned groups on an artist profile.
     * Public endpoint; requester header is optional (for unread/membership context).
     */
    @GetMapping("/pinned/{userId}")
    public ResponseEntity<?> getPinnedGroups(
            @PathVariable("userId") String profileUserId,
            @RequestHeader(value = "X-User-Id", required = false) String requesterUserId) {
        List<GroupSummaryDTO> groups = groupService.getPinnedGroupsForProfile(profileUserId, requesterUserId);
        return ResponseEntity.ok(Map.of("success", true, "data", groups));
    }

    /**
     * Join group (self-join)
     */
    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        GroupConversation group = groupService.joinGroup(groupId, userId);
        return ResponseEntity.ok(Map.of("success", true, "data", group.getId()));
    }

    /**
     * Leave group
     */
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        GroupConversation group = groupService.leaveGroup(groupId, userId);
        return ResponseEntity.ok(Map.of("success", true, "data", group.getId()));
    }

    /**
     * Get group details
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {

        // Only allow access if user is a member; then return a consistent summary payload
        List<GroupConversation> userGroups = groupService.getUserGroups(userId);
        boolean hasAccess = userGroups.stream().anyMatch(g -> g.getId().equals(groupId));
        if (!hasAccess) {
            throw new IllegalArgumentException("Group not found or access denied");
        }

        GroupSummaryDTO summary = groupService.getGroupSummaryById(groupId, userId);
        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }

    /**
     * Add member to group
     */
    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable("groupId") String groupId,
            @RequestBody AddMemberRequest request,
            @RequestHeader("X-User-Id") String userId) {

        boolean success = groupService.addMember(groupId, request.getUserId(), userId);
        if (!success) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Remove member from group
     */
    @DeleteMapping("/{groupId}/members/{targetUserId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable("groupId") String groupId,
            @PathVariable("targetUserId") String targetUserId,
            @RequestHeader("X-User-Id") String userId) {

        boolean success = groupService.removeMember(groupId, targetUserId, userId);
        if (!success) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Send message to group
     */
    @PostMapping("/{groupId}/messages")
    public ResponseEntity<GroupMessage> sendMessage(
            @PathVariable("groupId") String groupId,
            @RequestBody SendMessageRequest request,
            @RequestHeader("X-User-Id") String userId) {

        GroupMessage message = groupService.sendMessage(
                groupId,
                userId,
                request.getContent(),
                request.getMessageType() != null ? request.getMessageType() : GroupMessage.MessageType.TEXT
        );

        return ResponseEntity.ok(message);
    }

    /**
     * Get messages from group
     */
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<List<GroupMessage>> getMessages(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "50") int size) {

        List<GroupMessage> messages = groupService.getMessages(groupId, userId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Get pending messages for approval
     */
    @GetMapping("/{groupId}/messages/pending")
    public ResponseEntity<List<GroupMessage>> getPendingMessages(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {

        List<GroupMessage> messages = groupService.getPendingMessages(groupId, userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Approve or reject message
     */
    @PostMapping("/messages/{messageId}/approve")
    public ResponseEntity<Void> approveMessage(
            @PathVariable("messageId") String messageId,
            @RequestBody ApproveMessageRequest request,
            @RequestHeader("X-User-Id") String userId) {

        boolean success = groupService.approveMessage(messageId, userId, request.isApprove(), request.getNote());
        if (!success) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Delete message
     */
    @DeleteMapping("/messages/{messageId}")
    public ResponseEntity<Void> deleteMessage(
            @PathVariable("messageId") String messageId,
            @RequestHeader("X-User-Id") String userId) {

        boolean success = groupService.deleteMessage(messageId, userId);
        if (!success) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Update group settings
     */
    @PutMapping("/{groupId}")
    public ResponseEntity<Void> updateGroupSettings(
            @PathVariable("groupId") String groupId,
            @RequestBody UpdateGroupRequest request,
            @RequestHeader("X-User-Id") String userId) {

        boolean success = groupService.updateGroupSettings(
                groupId,
                userId,
                request.getName(),
                request.getDescription(),
                request.getMessageApprovalType(),
                request.isPrivate()
        );

        if (!success) {
            return ResponseEntity.badRequest().build();
        }

        return ResponseEntity.ok().build();
    }

    /**
     * Update chat permissions: all members vs selected members.
     */
    @PutMapping("/{groupId}/chat-permissions")
    public ResponseEntity<?> updateChatPermissions(
            @PathVariable("groupId") String groupId,
            @RequestBody UpdateChatPermissionsRequest request,
            @RequestHeader("X-User-Id") String userId) {
        boolean ok = groupService.updateChatPermissions(
                groupId,
                userId,
                request.isAllowAllMembersChat(),
                request.getAllowedChatMemberIds()
        );
        if (!ok) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Cannot update chat permissions"));
        }
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Check user permissions for a group
     */
    @GetMapping("/{groupId}/permissions")
    public ResponseEntity<Map<String, Boolean>> getPermissions(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {

        Map<String, Boolean> permissions = Map.of(
                "canSendMessages", permissionService.canSendMessage(userId, groupId),
                "canApproveMessages", permissionService.canApproveMessages(userId, groupId),
                "canManageGroup", permissionService.canManageGroup(userId, groupId),
                "canEditSettings", permissionService.canEditGroupSettings(userId, groupId),
                "canInviteMembers", permissionService.canInviteMembers(userId, groupId),
                "isAdmin", permissionService.isAdmin(userId, groupId)
        );

        return ResponseEntity.ok(permissions);
    }

    // Request/Response DTOs
    public static class CreateGroupRequest {
        private String name;
        private String description;
        private List<String> initialMembers;
        private Boolean allowAllMembersChat;
        private List<String> allowedChatMemberIds;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<String> getInitialMembers() { return initialMembers; }
        public void setInitialMembers(List<String> initialMembers) { this.initialMembers = initialMembers; }

        public Boolean getAllowAllMembersChat() { return allowAllMembersChat; }
        public void setAllowAllMembersChat(Boolean allowAllMembersChat) { this.allowAllMembersChat = allowAllMembersChat; }

        public List<String> getAllowedChatMemberIds() { return allowedChatMemberIds; }
        public void setAllowedChatMemberIds(List<String> allowedChatMemberIds) { this.allowedChatMemberIds = allowedChatMemberIds; }
    }

    public static class UpdateChatPermissionsRequest {
        private boolean allowAllMembersChat = true;
        private List<String> allowedChatMemberIds;

        public boolean isAllowAllMembersChat() { return allowAllMembersChat; }
        public void setAllowAllMembersChat(boolean allowAllMembersChat) { this.allowAllMembersChat = allowAllMembersChat; }

        public List<String> getAllowedChatMemberIds() { return allowedChatMemberIds; }
        public void setAllowedChatMemberIds(List<String> allowedChatMemberIds) { this.allowedChatMemberIds = allowedChatMemberIds; }
    }

    public static class AddMemberRequest {
        private String userId;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
    }

    public static class SendMessageRequest {
        private String content;
        private GroupMessage.MessageType messageType;

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }

        public GroupMessage.MessageType getMessageType() { return messageType; }
        public void setMessageType(GroupMessage.MessageType messageType) { this.messageType = messageType; }
    }

    public static class ApproveMessageRequest {
        private boolean approve;
        private String note;

        public boolean isApprove() { return approve; }
        public void setApprove(boolean approve) { this.approve = approve; }

        public String getNote() { return note; }
        public void setNote(String note) { this.note = note; }
    }

    public static class UpdateGroupRequest {
        private String name;
        private String description;
        private GroupConversation.MessageApprovalType messageApprovalType;
        private boolean isPrivate;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public GroupConversation.MessageApprovalType getMessageApprovalType() { return messageApprovalType; }
        public void setMessageApprovalType(GroupConversation.MessageApprovalType messageApprovalType) { this.messageApprovalType = messageApprovalType; }

        public boolean isPrivate() { return isPrivate; }
        public void setPrivate(boolean isPrivate) { this.isPrivate = isPrivate; }
    }
}
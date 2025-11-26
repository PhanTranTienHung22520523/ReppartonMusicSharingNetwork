package com.DA2.messageservice.controller;

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
                request.getInitialMembers()
        );

        return ResponseEntity.ok(group);
    }

    /**
     * Get user's groups
     */
    @GetMapping
    public ResponseEntity<List<GroupConversation>> getUserGroups(@RequestHeader("X-User-Id") String userId) {
        List<GroupConversation> groups = groupService.getUserGroups(userId);
        return ResponseEntity.ok(groups);
    }

    /**
     * Get group details
     */
    @GetMapping("/{groupId}")
    public ResponseEntity<GroupConversation> getGroup(
            @PathVariable String groupId,
            @RequestHeader("X-User-Id") String userId) {

        List<GroupConversation> userGroups = groupService.getUserGroups(userId);
        GroupConversation group = userGroups.stream()
                .filter(g -> g.getId().equals(groupId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Group not found or access denied"));

        return ResponseEntity.ok(group);
    }

    /**
     * Add member to group
     */
    @PostMapping("/{groupId}/members")
    public ResponseEntity<Void> addMember(
            @PathVariable String groupId,
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
            @PathVariable String groupId,
            @PathVariable String targetUserId,
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
            @PathVariable String groupId,
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
            @PathVariable String groupId,
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<GroupMessage> messages = groupService.getMessages(groupId, userId, page, size);
        return ResponseEntity.ok(messages);
    }

    /**
     * Get pending messages for approval
     */
    @GetMapping("/{groupId}/messages/pending")
    public ResponseEntity<List<GroupMessage>> getPendingMessages(
            @PathVariable String groupId,
            @RequestHeader("X-User-Id") String userId) {

        List<GroupMessage> messages = groupService.getPendingMessages(groupId, userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Approve or reject message
     */
    @PostMapping("/messages/{messageId}/approve")
    public ResponseEntity<Void> approveMessage(
            @PathVariable String messageId,
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
            @PathVariable String messageId,
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
            @PathVariable String groupId,
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
     * Check user permissions for a group
     */
    @GetMapping("/{groupId}/permissions")
    public ResponseEntity<Map<String, Boolean>> getPermissions(
            @PathVariable String groupId,
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

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public List<String> getInitialMembers() { return initialMembers; }
        public void setInitialMembers(List<String> initialMembers) { this.initialMembers = initialMembers; }
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
package com.DA2.messageservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Instant;

public class GroupSummaryDTO {
    private String id;

    // Display fields used by UI (kept similar to existing artist group UI)
    private String groupName;
    private String description;
    private String groupImageUrl;

    private String createdBy;
    private String creatorName;
    private String creatorAvatar;
    private String creatorRole; // USER, ARTIST (from user-service)

    private String groupType; // NORMAL, ARTIST

    private int memberCount;
    private boolean isPrivate;

    private String lastMessage;
    private Instant lastMessageTime;
    private long messageCount;

    // Read/unread (requester context)
    private boolean isUnread;
    private long unreadCount;

    // Chat permission (requester context)
    private boolean canSendMessages;

    // Optional: requester context
    private boolean isMember;

    public GroupSummaryDTO() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getGroupImageUrl() {
        return groupImageUrl;
    }

    public void setGroupImageUrl(String groupImageUrl) {
        this.groupImageUrl = groupImageUrl;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getCreatorName() {
        return creatorName;
    }

    public void setCreatorName(String creatorName) {
        this.creatorName = creatorName;
    }

    public String getCreatorAvatar() {
        return creatorAvatar;
    }

    public void setCreatorAvatar(String creatorAvatar) {
        this.creatorAvatar = creatorAvatar;
    }

    public String getCreatorRole() {
        return creatorRole;
    }

    public void setCreatorRole(String creatorRole) {
        this.creatorRole = creatorRole;
    }

    public String getGroupType() {
        return groupType;
    }

    public void setGroupType(String groupType) {
        this.groupType = groupType;
    }

    public int getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(int memberCount) {
        this.memberCount = memberCount;
    }

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public Instant getLastMessageTime() {
        return lastMessageTime;
    }

    public void setLastMessageTime(Instant lastMessageTime) {
        this.lastMessageTime = lastMessageTime;
    }

    public long getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(long messageCount) {
        this.messageCount = messageCount;
    }

    public boolean isUnread() {
        return isUnread;
    }

    public void setUnread(boolean unread) {
        isUnread = unread;
    }

    public long getUnreadCount() {
        return unreadCount;
    }

    public void setUnreadCount(long unreadCount) {
        this.unreadCount = unreadCount;
    }

    public boolean isCanSendMessages() {
        return canSendMessages;
    }

    public void setCanSendMessages(boolean canSendMessages) {
        this.canSendMessages = canSendMessages;
    }

    /**
     * Frontend expects `isMember`.
     */
    @JsonProperty("isMember")
    public boolean isMember() {
        return isMember;
    }

    /**
     * Backward compatible alias: `member`.
     */
    @JsonProperty("member")
    public boolean getMember() {
        return isMember;
    }

    @JsonProperty("member")
    public void setMember(boolean member) {
        isMember = member;
    }

    @JsonProperty("isMember")
    public void setIsMember(boolean member) {
        isMember = member;
    }
}

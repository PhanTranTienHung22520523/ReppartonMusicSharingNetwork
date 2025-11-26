package com.DA2.messageservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "group_messages")
public class GroupMessage {
    @Id
    private String id;
    private String groupConversationId;
    private String senderId;
    private String content;
    private MessageType messageType;
    private LocalDateTime sentAt;

    // Approval system
    @Builder.Default
    private MessageStatus status = MessageStatus.PENDING;
    private String approvedBy; // User ID who approved/rejected
    private LocalDateTime approvedAt;
    private String approvalNote;

    // Message metadata
    private String replyToMessageId; // For reply functionality
    @Builder.Default
    private boolean isEdited = false;
    private LocalDateTime editedAt;

    public enum MessageType {
        TEXT,
        IMAGE,
        VIDEO,
        AUDIO,
        FILE,
        SYSTEM // For system messages like member joined/left
    }

    public enum MessageStatus {
        PENDING,    // Waiting for approval
        APPROVED,   // Approved and visible to all
        REJECTED,   // Rejected by moderator/admin
        DELETED     // Deleted by sender or admin
    }

    public void approve(String approvedBy) {
        this.status = MessageStatus.APPROVED;
        this.approvedBy = approvedBy;
        this.approvedAt = LocalDateTime.now();
    }

    public void reject(String approvedBy, String note) {
        this.status = MessageStatus.REJECTED;
        this.approvedBy = approvedBy;
        this.approvedAt = LocalDateTime.now();
        this.approvalNote = note;
    }

    public void delete() {
        this.status = MessageStatus.DELETED;
    }

    public boolean isVisible() {
        return status == MessageStatus.APPROVED;
    }
}
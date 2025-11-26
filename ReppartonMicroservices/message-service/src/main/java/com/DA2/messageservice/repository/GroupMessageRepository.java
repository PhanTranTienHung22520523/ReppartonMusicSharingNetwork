package com.DA2.messageservice.repository;

import com.DA2.messageservice.entity.GroupMessage;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface GroupMessageRepository extends MongoRepository<GroupMessage, String> {

    // Find messages by group conversation
    List<GroupMessage> findByGroupConversationIdOrderBySentAtAsc(String groupConversationId);

    // Find messages by group conversation with pagination
    List<GroupMessage> findByGroupConversationIdOrderBySentAtDesc(String groupConversationId, Pageable pageable);

    // Find approved messages only (visible messages)
    @Query("{ 'groupConversationId': ?0, 'status': 'APPROVED' }")
    List<GroupMessage> findApprovedMessagesByGroupId(String groupConversationId);

    // Find pending messages for approval
    @Query("{ 'groupConversationId': ?0, 'status': 'PENDING' }")
    List<GroupMessage> findPendingMessagesByGroupId(String groupConversationId);

    // Find messages by sender
    List<GroupMessage> findBySenderIdAndGroupConversationIdOrderBySentAtDesc(String senderId, String groupConversationId);

    // Find messages after a specific time
    List<GroupMessage> findByGroupConversationIdAndSentAtAfterOrderBySentAtAsc(String groupConversationId, LocalDateTime after);

    // Count approved messages in a group
    @Query(value = "{ 'groupConversationId': ?0, 'status': 'APPROVED' }", count = true)
    long countApprovedMessagesByGroupId(String groupConversationId);

    // Count pending messages in a group
    @Query(value = "{ 'groupConversationId': ?0, 'status': 'PENDING' }", count = true)
    long countPendingMessagesByGroupId(String groupConversationId);

    // Find messages by status
    List<GroupMessage> findByGroupConversationIdAndStatus(String groupConversationId, GroupMessage.MessageStatus status);

    // Find messages by reply to message
    List<GroupMessage> findByReplyToMessageId(String replyToMessageId);
}
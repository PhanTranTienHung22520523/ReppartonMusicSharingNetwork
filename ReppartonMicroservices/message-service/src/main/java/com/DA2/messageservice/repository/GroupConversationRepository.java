package com.DA2.messageservice.repository;

import com.DA2.messageservice.entity.GroupConversation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupConversationRepository extends MongoRepository<GroupConversation, String> {

    // Find groups where user is a member
    @Query("{ 'memberIds': ?0 }")
    List<GroupConversation> findByMemberId(String userId);

    // Find groups created by user
    List<GroupConversation> findByCreatedBy(String userId);

    // Find public groups (not private)
    List<GroupConversation> findByIsPrivateFalse();

    // Find groups by name (case-insensitive search)
    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<GroupConversation> findByNameContaining(String name);

    // Find groups where user is admin or owner
    @Query("{ 'members': { $elemMatch: { 'userId': ?0, 'role': { $in: ['OWNER', 'ADMIN'] } } } }")
    List<GroupConversation> findByAdminUserId(String userId);

    // Count total members in a group
    @Query(value = "{ '_id': ?0 }", fields = "{ 'memberIds': 1 }")
    GroupConversation findMemberCountById(String groupId);
}
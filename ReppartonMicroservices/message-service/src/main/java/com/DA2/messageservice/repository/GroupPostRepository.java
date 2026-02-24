package com.DA2.messageservice.repository;

import com.DA2.messageservice.entity.GroupPost;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupPostRepository extends MongoRepository<GroupPost, String> {
    
    List<GroupPost> findByGroupIdOrderByCreatedAtDesc(String groupId);
    
    List<GroupPost> findByArtistIdOrderByCreatedAtDesc(String artistId);
    
    long countByGroupId(String groupId);
}

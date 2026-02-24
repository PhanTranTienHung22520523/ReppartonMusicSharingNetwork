package com.DA2.messageservice.repository;

import com.DA2.messageservice.entity.ArtistGroup;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ArtistGroupRepository extends MongoRepository<ArtistGroup, String> {
    
    List<ArtistGroup> findByArtistId(String artistId);
    
    List<ArtistGroup> findByMemberIdsContaining(String userId);
    
    List<ArtistGroup> findByIsActiveTrue();
    
    Optional<ArtistGroup> findByIdAndIsActiveTrue(String id);
    
    List<ArtistGroup> findByArtistIdAndIsActiveTrue(String artistId);
}

package com.DA2.socialservice.repository;

import com.DA2.socialservice.entity.Like;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LikeRepository extends MongoRepository<Like, String> {

    Optional<Like> findByUserIdAndItemIdAndItemType(String userId, String itemId, String itemType);

    List<Like> findByUserId(String userId);
    List<Like> findByItemIdAndItemType(String itemId, String itemType);

    long countByItemIdAndItemType(String itemId, String itemType);

    void deleteByUserIdAndItemIdAndItemType(String userId, String itemId, String itemType);
}
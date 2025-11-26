package com.DA2.socialservice.repository;

import com.DA2.socialservice.entity.Share;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShareRepository extends MongoRepository<Share, String> {

    List<Share> findByUserId(String userId);
    List<Share> findByItemIdAndItemType(String itemId, String itemType);

    long countByItemIdAndItemType(String itemId, String itemType);
}
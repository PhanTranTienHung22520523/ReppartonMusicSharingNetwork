package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Share;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ShareRepo extends MongoRepository<Share, String> {
    List<Share> findByUserId(String userId);
    List<Share> findBySongId(String songId);
}


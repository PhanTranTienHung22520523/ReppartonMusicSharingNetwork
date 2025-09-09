package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.SearchHistory;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface SearchHistoryRepo extends MongoRepository<SearchHistory, String> {
    List<SearchHistory> findByUserIdOrderBySearchedAtDesc(String userId);
}

package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.SearchHistory;
import com.DA2.Repparton.Repository.SearchHistoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SearchHistoryService {
    @Autowired
    private SearchHistoryRepo searchHistoryRepository;

    public SearchHistory save(String userId, String query) {
        SearchHistory history = new SearchHistory(null, userId, query, LocalDateTime.now());
        return searchHistoryRepository.save(history);
    }

    public List<SearchHistory> getHistory(String userId) {
        return searchHistoryRepository.findByUserIdOrderBySearchedAtDesc(userId);
    }
}

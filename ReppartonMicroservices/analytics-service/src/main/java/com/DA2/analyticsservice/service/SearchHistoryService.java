package com.DA2.analyticsservice.service;

import com.DA2.analyticsservice.entity.SearchHistory;
import com.DA2.analyticsservice.repository.SearchHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SearchHistoryService {
    
    @Autowired
    private SearchHistoryRepository repository;

    public SearchHistory addSearchHistory(String userId, String query) {
        SearchHistory history = new SearchHistory(userId, query);
        return repository.save(history);
    }

    public List<SearchHistory> getUserSearchHistory(String userId) {
        return repository.findByUserIdOrderBySearchedAtDesc(userId);
    }

    public List<SearchHistory> getSearchesByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByDateRange(start, end);
    }

    public List<SearchHistory> findByKeyword(String keyword) {
        return repository.findByQueryContaining(keyword);
    }
}
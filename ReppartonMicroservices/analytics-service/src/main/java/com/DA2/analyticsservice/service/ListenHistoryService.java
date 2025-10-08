package com.DA2.analyticsservice.service;

import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.repository.ListenHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListenHistoryService {
    
    @Autowired
    private ListenHistoryRepository repository;

    public ListenHistory addListenHistory(String userId, String songId) {
        ListenHistory history = new ListenHistory(userId, songId);
        return repository.save(history);
    }

    public List<ListenHistory> getUserHistory(String userId) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<ListenHistory> getSongHistory(String songId) {
        return repository.findBySongId(songId);
    }

    public long getSongPlayCount(String songId) {
        return repository.countBySongId(songId);
    }

    public long getUserListenCount(String userId) {
        return repository.countByUserId(userId);
    }

    public List<ListenHistory> getHistoryByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByDateRange(start, end);
    }
}
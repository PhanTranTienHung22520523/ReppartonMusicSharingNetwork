package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.ListenHistory;
import com.DA2.Repparton.Repository.ListenHistoryRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ListenHistoryService {
    @Autowired
    private ListenHistoryRepo repository;

    public ListenHistory save(String userId, String songId) {
        ListenHistory history = new ListenHistory(null, userId, songId, LocalDateTime.now());
        return repository.save(history);
    }

    public List<ListenHistory> getHistory(String userId) {
        return repository.findByUserId(userId);
    }
}

package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.entity.SearchHistory;
import com.DA2.analyticsservice.service.SearchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/search-history")
@CrossOrigin(origins = "*")
public class SearchHistoryController {

    @Autowired
    private SearchHistoryService service;

    @PostMapping
    public ResponseEntity<SearchHistory> addHistory(@RequestParam String userId, 
                                                     @RequestParam String query) {
        try {
            SearchHistory history = service.addSearchHistory(userId, query);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SearchHistory>> getUserSearchHistory(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(service.getUserSearchHistory(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchHistory>> searchByKeyword(@RequestParam String keyword) {
        try {
            return ResponseEntity.ok(service.findByKeyword(keyword));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
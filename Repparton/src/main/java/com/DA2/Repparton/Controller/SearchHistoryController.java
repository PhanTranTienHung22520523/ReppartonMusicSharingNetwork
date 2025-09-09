package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.SearchHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search-history")
public class SearchHistoryController {
    @Autowired
    private SearchHistoryService service;

    @PostMapping
    public ResponseEntity<?> save(@RequestParam String userId, @RequestParam String query) {
        return ResponseEntity.ok(service.save(userId, query));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> get(@PathVariable String userId) {
        return ResponseEntity.ok(service.getHistory(userId));
    }
}


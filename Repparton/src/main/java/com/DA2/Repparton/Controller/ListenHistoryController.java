package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.ListenHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/listen-history")
public class ListenHistoryController {
    @Autowired
    private ListenHistoryService service;

    @PostMapping
    public ResponseEntity<?> save(@RequestParam String userId, @RequestParam String songId) {
        return ResponseEntity.ok(service.save(userId, songId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> get(@PathVariable String userId) {
        return ResponseEntity.ok(service.getHistory(userId));
    }
}


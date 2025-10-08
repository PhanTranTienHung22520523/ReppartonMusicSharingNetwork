package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.service.ListenHistoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/analytics/listen-history")
@CrossOrigin(origins = "*")
public class ListenHistoryController {

    @Autowired
    private ListenHistoryService service;

    @PostMapping
    public ResponseEntity<ListenHistory> addHistory(@RequestParam String userId, 
                                                     @RequestParam String songId) {
        try {
            ListenHistory history = service.addListenHistory(userId, songId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ListenHistory>> getUserHistory(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(service.getUserHistory(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/song/{songId}")
    public ResponseEntity<List<ListenHistory>> getSongHistory(@PathVariable String songId) {
        try {
            return ResponseEntity.ok(service.getSongHistory(songId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/song/{songId}/count")
    public ResponseEntity<Long> getSongPlayCount(@PathVariable String songId) {
        try {
            return ResponseEntity.ok(service.getSongPlayCount(songId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserListenCount(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(service.getUserListenCount(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
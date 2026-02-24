package com.DA2.analyticsservice.controller;

import com.DA2.analyticsservice.entity.ListenHistory;
import com.DA2.analyticsservice.service.ListenHistoryService;
import com.DA2.analyticsservice.service.GenreLearningService;
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
    
    @Autowired
    private GenreLearningService genreLearningService;

    @PostMapping
    public ResponseEntity<ListenHistory> addHistory(@RequestParam("userId") String userId, 
                                                     @RequestParam("songId") String songId,
                                                     @RequestParam(value = "artistId", required = false) String artistId) {
        try {
            ListenHistory history = service.addListenHistory(userId, songId, artistId);
            
            // Trigger genre learning (will analyze after 5 listens)
            genreLearningService.recordListen(userId);
            
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ListenHistory>> getUserHistory(@PathVariable("userId") String userId) {
        try {
            return ResponseEntity.ok(service.getUserHistory(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/song/{songId}")
    public ResponseEntity<List<ListenHistory>> getSongHistory(@PathVariable("songId") String songId) {
        try {
            return ResponseEntity.ok(service.getSongHistory(songId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/song/{songId}/count")
    public ResponseEntity<Long> getSongPlayCount(@PathVariable("songId") String songId) {
        try {
            return ResponseEntity.ok(service.getSongPlayCount(songId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}/count")
    public ResponseEntity<Long> getUserListenCount(@PathVariable("userId") String userId) {
        try {
            return ResponseEntity.ok(service.getUserListenCount(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
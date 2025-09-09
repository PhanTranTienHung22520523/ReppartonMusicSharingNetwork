package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.ShareService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shares")
public class ShareController {
    @Autowired
    private ShareService shareService;

    @PostMapping
    public ResponseEntity<?> share(@RequestParam String userId,
                                   @RequestParam String songId,
                                   @RequestParam String platform) {
        return ResponseEntity.ok(shareService.shareSong(userId, songId, platform));
    }

    @GetMapping("/song/{songId}")
    public ResponseEntity<?> getBySong(@PathVariable String songId) {
        return ResponseEntity.ok(shareService.getSharesBySong(songId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(shareService.getSharesByUser(userId));
    }
}


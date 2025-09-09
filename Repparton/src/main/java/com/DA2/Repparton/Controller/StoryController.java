package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Entity.Story;
import com.DA2.Repparton.Service.StoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/stories")
@CrossOrigin(origins = "*")
public class StoryController {

    @Autowired
    private StoryService storyService;

    @PostMapping(value = "/create", consumes = "multipart/form-data")
    public ResponseEntity<?> create(@RequestParam String userId,
                                    @RequestParam String type,
                                    @RequestParam(required = false) String textContent,
                                    @RequestParam(required = false) MultipartFile contentFile,
                                    @RequestParam(required = false) String songId,
                                    @RequestParam(defaultValue = "false") boolean isPrivate) {
        try {
            Story story = storyService.createStory(userId, type, textContent, contentFile, songId, isPrivate);
            return ResponseEntity.ok(story);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi upload story: " + e.getMessage());
        }
    }

    @PostMapping(value = "/create-auth", consumes = "multipart/form-data")
    public ResponseEntity<?> createAuthenticated(@RequestParam String type,
                                                @RequestParam(required = false) String textContent,
                                                @RequestParam(required = false) MultipartFile contentFile,
                                                @RequestParam(required = false) String songId,
                                                @RequestParam(defaultValue = "false") boolean isPrivate,
                                                Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = auth.getName();
            Story story = storyService.createStory(userId, type, textContent, contentFile, songId, isPrivate);
            return ResponseEntity.ok(story);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Lỗi upload story: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicStories() {
        try {
            return ResponseEntity.ok(storyService.getPublicStories());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getByUser(@PathVariable String userId) {
        try {
            return ResponseEntity.ok(storyService.getStoriesByUser(userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id, Authentication auth) {
        try {
            if (auth == null) {
                return ResponseEntity.status(401).body("Authentication required");
            }
            String userId = auth.getName();
            storyService.deleteStory(id, userId);
            return ResponseEntity.ok("Story deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}

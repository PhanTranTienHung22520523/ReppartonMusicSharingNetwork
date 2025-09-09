package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Service.StoryInteractionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stories")
public class StoryInteractionController {

    @Autowired
    private StoryInteractionService interactionService;

    @PostMapping("/{storyId}/like")
    public ResponseEntity<?> likeStory(@PathVariable String storyId,
                                       @RequestParam String userId) {
        boolean success = interactionService.likeStory(storyId, userId);
        return ResponseEntity.ok(success ? "Liked" : "Already liked");
    }

    @PostMapping("/{storyId}/view")
    public ResponseEntity<?> viewStory(@PathVariable String storyId,
                                       @RequestParam String userId) {
        boolean success = interactionService.viewStory(storyId, userId);
        return ResponseEntity.ok(success ? "Viewed" : "Already viewed");
    }

    @GetMapping("/{storyId}/likes")
    public ResponseEntity<Long> getLikes(@PathVariable String storyId) {
        return ResponseEntity.ok(interactionService.getLikes(storyId));
    }

    @GetMapping("/{storyId}/views")
    public ResponseEntity<Long> getViews(@PathVariable String storyId) {
        return ResponseEntity.ok(interactionService.getViews(storyId));
    }
}

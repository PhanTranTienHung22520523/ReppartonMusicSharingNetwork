package com.DA2.messageservice.controller;

import com.DA2.messageservice.entity.ArtistGroup;
import com.DA2.messageservice.entity.GroupPost;
import com.DA2.messageservice.entity.GroupMessage;
import com.DA2.messageservice.service.ArtistGroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/artist-groups")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ArtistGroupController {
    
    private final ArtistGroupService groupService;
    
    // ========== GROUP MANAGEMENT ==========
    
    @PostMapping
    public ResponseEntity<?> createGroup(
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            String artistName = request.get("artistName");
            String groupName = request.get("groupName");
            String description = request.get("description");
            
            ArtistGroup group = groupService.createGroup(userId, artistName, groupName, description);
            return ResponseEntity.ok(Map.of("success", true, "data", group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/{groupId}")
    public ResponseEntity<?> getGroup(@PathVariable("groupId") String groupId) {
        try {
            return groupService.getGroupById(groupId)
                    .map(group -> ResponseEntity.ok(Map.of("success", true, "data", group)))
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getGroupsByArtist(@PathVariable("artistId") String artistId) {
        try {
            List<ArtistGroup> groups = groupService.getGroupsByArtist(artistId);
            return ResponseEntity.ok(Map.of("success", true, "data", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/member/{userId}")
    public ResponseEntity<?> getGroupsByMember(@PathVariable("userId") String userId) {
        try {
            List<ArtistGroup> groups = groupService.getGroupsByMember(userId);
            return ResponseEntity.ok(Map.of("success", true, "data", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping
    public ResponseEntity<?> getAllGroups() {
        try {
            List<ArtistGroup> groups = groupService.getAllActiveGroups();
            return ResponseEntity.ok(Map.of("success", true, "data", groups));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PutMapping("/{groupId}")
    public ResponseEntity<?> updateGroup(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            String groupName = request.get("groupName");
            String description = request.get("description");
            String imageUrl = request.get("imageUrl");
            
            ArtistGroup group = groupService.updateGroup(groupId, userId, groupName, description, imageUrl);
            return ResponseEntity.ok(Map.of("success", true, "data", group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/{groupId}")
    public ResponseEntity<?> deleteGroup(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            groupService.deleteGroup(groupId, userId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Group deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // ========== MEMBER MANAGEMENT ==========
    
    @PostMapping("/{groupId}/join")
    public ResponseEntity<?> joinGroup(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            ArtistGroup group = groupService.joinGroup(groupId, userId);
            return ResponseEntity.ok(Map.of("success", true, "data", group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/{groupId}/leave")
    public ResponseEntity<?> leaveGroup(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            ArtistGroup group = groupService.leaveGroup(groupId, userId);
            return ResponseEntity.ok(Map.of("success", true, "data", group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/{groupId}/invite-chat")
    public ResponseEntity<?> inviteToChat(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String artistId) {
        try {
            String userId = request.get("userId");
            ArtistGroup group = groupService.inviteToChat(groupId, artistId, userId);
            return ResponseEntity.ok(Map.of("success", true, "data", group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @PostMapping("/{groupId}/revoke-chat")
    public ResponseEntity<?> revokeChat(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String artistId) {
        try {
            String userId = request.get("userId");
            ArtistGroup group = groupService.revokeChat(groupId, artistId, userId);
            return ResponseEntity.ok(Map.of("success", true, "data", group));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // ========== POST MANAGEMENT ==========
    
    @PostMapping("/{groupId}/posts")
    public ResponseEntity<?> createPost(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String artistId) {
        try {
            String artistName = request.get("artistName");
            String content = request.get("content");
            String mediaUrl = request.get("mediaUrl");
            String mediaType = request.get("mediaType");
            
            GroupPost post = groupService.createPost(groupId, artistId, artistName, content, mediaUrl, mediaType);
            return ResponseEntity.ok(Map.of("success", true, "data", post));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/{groupId}/posts")
    public ResponseEntity<?> getGroupPosts(@PathVariable("groupId") String groupId) {
        try {
            List<GroupPost> posts = groupService.getGroupPosts(groupId);
            return ResponseEntity.ok(Map.of("success", true, "data", posts));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @DeleteMapping("/posts/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable("postId") String postId,
            @RequestHeader("X-User-Id") String artistId) {
        try {
            groupService.deletePost(postId, artistId);
            return ResponseEntity.ok(Map.of("success", true, "message", "Post deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // ========== CHAT MESSAGES ==========
    
    @PostMapping("/{groupId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable("groupId") String groupId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            String userName = request.get("userName");
            String content = request.get("content");
            
            GroupMessage message = groupService.sendMessage(groupId, userId, userName, content);
            return ResponseEntity.ok(Map.of("success", true, "data", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/{groupId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            List<GroupMessage> messages = groupService.getGroupMessages(groupId, userId);
            return ResponseEntity.ok(Map.of("success", true, "data", messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    // ========== PERMISSIONS ==========
    
    @GetMapping("/{groupId}/can-chat")
    public ResponseEntity<?> canChat(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            boolean canChat = groupService.canChat(groupId, userId);
            return ResponseEntity.ok(Map.of("success", true, "canChat", canChat));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
    
    @GetMapping("/{groupId}/is-owner")
    public ResponseEntity<?> isOwner(
            @PathVariable("groupId") String groupId,
            @RequestHeader("X-User-Id") String userId) {
        try {
            boolean isOwner = groupService.isOwner(groupId, userId);
            return ResponseEntity.ok(Map.of("success", true, "isOwner", isOwner));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}

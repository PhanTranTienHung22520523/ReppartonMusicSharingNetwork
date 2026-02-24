package com.DA2.userservice.controller;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.userservice.dto.UserResponse;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    
    private final AdminService adminService;
    
    // ========== USER MANAGEMENT ==========
    
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserResponse> users = adminService.getAllUsers(adminId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/users/search")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> searchUsers(
            @RequestParam(value = "keyword") String keyword,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<UserResponse> users = adminService.searchUsers(adminId, keyword, pageable);
            return ResponseEntity.ok(ApiResponse.success("Search completed", users));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/ban")
    public ResponseEntity<ApiResponse<User>> banUser(
            @PathVariable("userId") String userId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            String reason = request.get("reason");
            User user = adminService.banUser(adminId, userId, reason);
            return ResponseEntity.ok(ApiResponse.success("User banned", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/users/{userId}/unban")
    public ResponseEntity<ApiResponse<User>> unbanUser(
            @PathVariable("userId") String userId,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            User user = adminService.unbanUser(adminId, userId);
            return ResponseEntity.ok(ApiResponse.success("User unbanned", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable("userId") String userId,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            adminService.deleteUser(adminId, userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/users/{userId}/activity")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserActivity(
            @PathVariable("userId") String userId,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Map<String, Object> activity = adminService.getUserActivity(adminId, userId);
            return ResponseEntity.ok(ApiResponse.success("Activity retrieved", activity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== ARTIST VERIFICATION ==========
    
    @GetMapping("/artists/pending")
    public ResponseEntity<ApiResponse<Page<User>>> getPendingArtists(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> artists = adminService.getPendingArtists(adminId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Pending artists retrieved", artists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/artists/approved")
    public ResponseEntity<ApiResponse<Page<User>>> getApprovedArtists(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> artists = adminService.getApprovedArtists(adminId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Approved artists retrieved", artists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/artists/rejected")
    public ResponseEntity<ApiResponse<Page<User>>> getRejectedArtists(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<User> artists = adminService.getRejectedArtists(adminId, pageable);
            return ResponseEntity.ok(ApiResponse.success("Rejected artists retrieved", artists));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== SYSTEM STATISTICS ==========
    
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSystemStats(
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Map<String, Object> stats = adminService.getSystemStats(adminId);
            return ResponseEntity.ok(ApiResponse.success("Stats retrieved", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @GetMapping("/stats/users")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(
            @RequestHeader("X-User-Id") String adminId) {
        try {
            Map<String, Object> stats = adminService.getUserStats(adminId);
            return ResponseEntity.ok(ApiResponse.success("User stats retrieved", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

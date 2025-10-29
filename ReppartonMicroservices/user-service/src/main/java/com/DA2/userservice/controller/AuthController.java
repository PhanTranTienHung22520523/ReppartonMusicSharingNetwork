package com.DA2.userservice.controller;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.userservice.dto.LoginRequest;
import com.DA2.userservice.dto.RegisterRequest;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(@Valid @RequestBody LoginRequest request) {
        try {
            Map<String, Object> response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Map<String, Object>>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            Map<String, Object> response = authService.register(request);
            return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(@RequestBody Map<String, String> request) {
        try {
            String refreshToken = request.get("refreshToken");
            Map<String, String> response = authService.refreshToken(refreshToken);
            return ResponseEntity.ok(ApiResponse.success("Token refreshed", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-service"));
    }
    
    // ========== ARTIST VERIFICATION ENDPOINTS ==========
    
    @PostMapping("/artist/apply")
    public ResponseEntity<ApiResponse<User>> applyForArtist(
            @RequestBody Map<String, Object> request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            String artistName = (String) request.get("artistName");
            String documentUrl = (String) request.get("documentUrl");
            String socialMediaLinks = (String) request.get("socialMediaLinks");
            Integer verifiedSongsCount = (Integer) request.getOrDefault("verifiedSongsCount", 0);
            
            User user = authService.applyForArtistVerification(
                userId, artistName, documentUrl, socialMediaLinks, verifiedSongsCount
            );
            
            return ResponseEntity.ok(ApiResponse.success("Artist verification submitted", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/artist/resubmit")
    public ResponseEntity<ApiResponse<User>> resubmitArtistVerification(
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            String newDocumentUrl = request.get("documentUrl");
            User user = authService.resubmitArtistVerification(userId, newDocumentUrl);
            return ResponseEntity.ok(ApiResponse.success("Artist verification resubmitted", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/artist/approve/{userId}")
    public ResponseEntity<ApiResponse<User>> approveArtist(
            @PathVariable String userId,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            User user = authService.manualApproveArtist(userId, adminId);
            return ResponseEntity.ok(ApiResponse.success("Artist approved", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/artist/reject/{userId}")
    public ResponseEntity<ApiResponse<User>> rejectArtist(
            @PathVariable String userId,
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String adminId) {
        try {
            String reason = request.get("reason");
            User user = authService.manualRejectArtist(userId, adminId, reason);
            return ResponseEntity.ok(ApiResponse.success("Artist rejected", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


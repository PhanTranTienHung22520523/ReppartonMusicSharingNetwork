package com.DA2.userservice.controller;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.userservice.dto.LoginRequest;
import com.DA2.userservice.dto.RegisterRequest;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {
        try {
            if (request.getUserAgent() == null || request.getUserAgent().isBlank()) {
                String ua = httpRequest.getHeader("User-Agent");
                if (ua != null && !ua.isBlank()) {
                    request.setUserAgent(ua);
                }
            }

            if (request.getIpAddress() == null || request.getIpAddress().isBlank()) {
                request.setIpAddress(extractClientIp(httpRequest));
            }

            Map<String, Object> response = authService.login(request);
            return ResponseEntity.ok(ApiResponse.success("Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
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
    
    // ========== EMAIL VERIFICATION ENDPOINTS ==========
    
    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<String>> verifyEmail(@RequestParam("token") String token) {
        try {
            authService.verifyEmail(token);
            return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/resend-verification")
    public ResponseEntity<ApiResponse<String>> resendVerification(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.resendVerificationEmail(email);
            return ResponseEntity.ok(ApiResponse.success("Verification email sent", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/send-verification-code")
    public ResponseEntity<ApiResponse<String>> sendVerificationCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.sendVerificationCode(email);
            return ResponseEntity.ok(ApiResponse.success("Verification code sent", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<ApiResponse<String>> verifyCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");
            authService.verifyCode(email, code);
            return ResponseEntity.ok(ApiResponse.success("Email verified successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    // ========== PASSWORD RESET ENDPOINTS ==========
    
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            authService.sendPasswordResetEmail(email);
            return ResponseEntity.ok(ApiResponse.success("Password reset email sent", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Password reset successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") String userId) {
        try {
            String oldPassword = request.get("oldPassword");
            String newPassword = request.get("newPassword");
            authService.changePassword(userId, oldPassword, newPassword);
            return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
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
            @PathVariable("userId") String userId,
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
            @PathVariable("userId") String userId,
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

    @PostMapping("/artist/cancel")
    public ResponseEntity<ApiResponse<User>> cancelArtistApplication(
            @RequestHeader("X-User-Id") String userId) {
        try {
            User user = authService.cancelArtistVerification(userId);
            return ResponseEntity.ok(ApiResponse.success("Artist verification cancelled", user));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}


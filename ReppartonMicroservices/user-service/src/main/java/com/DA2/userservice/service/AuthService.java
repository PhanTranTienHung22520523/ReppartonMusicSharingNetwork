package com.DA2.userservice.service;

import com.DA2.userservice.dto.LoginRequest;
import com.DA2.userservice.dto.RegisterRequest;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.repository.UserRepository;
import com.DA2.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ArtistVerificationAIService verificationAIService;
    private final DeviceService deviceService;
    private final UserAnalyticsService userAnalyticsService;

    public Map<String, Object> login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }

        String accessToken = jwtUtil.generateToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        // Record device login for security monitoring
        if (request.getDeviceId() != null) {
            deviceService.recordDeviceLogin(
                user.getId(),
                request.getDeviceId(),
                request.getDeviceName(),
                request.getUserAgent(),
                request.getIpAddress(),
                accessToken // Use access token as session ID
            );
        }

        // Track user login event
        userAnalyticsService.trackLoginEvent(user.getId(), request.getIpAddress(), request.getDeviceId());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", convertToUserResponse(user));

        return response;
    }

    public Map<String, Object> register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        String accessToken = jwtUtil.generateToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", convertToUserResponse(user));

        return response;
    }

    public Map<String, String> refreshToken(String refreshToken) {
        String userId = jwtUtil.validateRefreshToken(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String newAccessToken = jwtUtil.generateToken(user.getId(), user.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("accessToken", newAccessToken);
        response.put("refreshToken", refreshToken);

        return response;
    }

    private Map<String, Object> convertToUserResponse(User user) {
        Map<String, Object> userResponse = new HashMap<>();
        userResponse.put("id", user.getId());
        userResponse.put("username", user.getUsername());
        userResponse.put("email", user.getEmail());
        userResponse.put("fullName", user.getFullName());
        userResponse.put("avatarUrl", user.getAvatarUrl());
        userResponse.put("role", user.getRole());
        return userResponse;
    }
    
    // ========== ARTIST VERIFICATION ==========
    
    public User applyForArtistVerification(String userId, String artistName, String documentUrl, 
                                          String socialMediaLinks, Integer verifiedSongsCount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if ("ARTIST".equals(user.getRole())) {
            throw new RuntimeException("User is already an artist");
        }
        
        if (user.getArtistVerification() != null && 
            "pending".equals(user.getArtistVerification().getStatus())) {
            throw new RuntimeException("Artist verification already pending");
        }
        
        // Use AI to verify artist application
        User.ArtistVerification verification = verificationAIService.verifyArtistApplication(
            artistName, documentUrl, socialMediaLinks, verifiedSongsCount
        );
        
        user.setArtistVerification(verification);
        user.setArtistPending("pending".equals(verification.getStatus()));
        
        // Auto-approve if AI confidence is high
        if ("approved".equals(verification.getStatus())) {
            user.setRole("ARTIST");
            user.setVerified(true);
            user.setArtistPending(false);
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    public User resubmitArtistVerification(String userId, String newDocumentUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getArtistVerification() == null) {
            throw new RuntimeException("No previous artist verification found");
        }
        
        if ("approved".equals(user.getArtistVerification().getStatus())) {
            throw new RuntimeException("Artist verification already approved");
        }
        
        // Re-evaluate using AI
        User.ArtistVerification updatedVerification = verificationAIService.reevaluateVerification(
            user.getArtistVerification(), newDocumentUrl
        );
        
        user.setArtistVerification(updatedVerification);
        user.setArtistPending("pending".equals(updatedVerification.getStatus()));
        
        // Auto-approve if AI confidence improved
        if ("approved".equals(updatedVerification.getStatus())) {
            user.setRole("ARTIST");
            user.setVerified(true);
            user.setArtistPending(false);
        }
        
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    public User manualApproveArtist(String userId, String adminId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getArtistVerification() == null) {
            throw new RuntimeException("No artist verification found");
        }
        
        User.ArtistVerification verification = user.getArtistVerification();
        verification.setStatus("approved");
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewedBy(adminId);
        verification.setRejectionReason(null);
        
        user.setRole("ARTIST");
        user.setVerified(true);
        user.setArtistPending(false);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    public User manualRejectArtist(String userId, String adminId, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getArtistVerification() == null) {
            throw new RuntimeException("No artist verification found");
        }
        
        User.ArtistVerification verification = user.getArtistVerification();
        verification.setStatus("rejected");
        verification.setReviewedAt(LocalDateTime.now());
        verification.setReviewedBy(adminId);
        verification.setRejectionReason(reason);
        
        user.setArtistPending(false);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
}


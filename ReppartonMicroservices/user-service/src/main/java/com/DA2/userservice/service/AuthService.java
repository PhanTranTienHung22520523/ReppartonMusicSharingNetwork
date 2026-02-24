package com.DA2.userservice.service;

import com.DA2.userservice.dto.LoginRequest;
import com.DA2.userservice.dto.RegisterRequest;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.entity.VerificationToken;
import com.DA2.userservice.repository.UserRepository;
import com.DA2.userservice.repository.VerificationTokenRepository;
import com.DA2.userservice.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final ArtistVerificationAIService verificationAIService;
    private final DeviceService deviceService;
    private final UserAnalyticsService userAnalyticsService;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final VerificationTokenRepository tokenRepository;

    @Value("${app.email.verification.fail-on-error:false}")
    private boolean failOnVerificationEmailError;

    @Value("${app.email.verification.expose-token:false}")
    private boolean exposeVerificationToken;

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

        // Send verification email
        String verificationToken = createVerificationToken(user, VerificationToken.TokenType.EMAIL_VERIFICATION);
        boolean verificationEmailSent = false;
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), verificationToken);
            verificationEmailSent = true;
        } catch (Exception e) {
            log.warn("Verification email could not be sent for userId={} email={}", user.getId(), user.getEmail(), e);
            if (failOnVerificationEmailError) {
                throw e;
            }
        }

        String accessToken = jwtUtil.generateToken(user.getId(), user.getUsername());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("accessToken", accessToken);
        response.put("refreshToken", refreshToken);
        response.put("user", convertToUserResponse(user));
        response.put("verificationEmailSent", verificationEmailSent);
        response.put("emailVerificationRequired", true);
        if (!verificationEmailSent && exposeVerificationToken) {
            response.put("emailVerificationToken", verificationToken);
        }

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
        userResponse.put("roles", user.getRoles());
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
            user.setRoles(java.util.Arrays.asList("USER", "ARTIST"));
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
            user.setRoles(java.util.Arrays.asList("USER", "ARTIST"));
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
        user.setRoles(java.util.Arrays.asList("USER", "ARTIST"));
        user.setVerified(true);
        user.setArtistPending(false);
        user.setUpdatedAt(LocalDateTime.now());

        User saved = userRepository.save(user);
        notificationService.sendNotification(
            saved.getId(),
            "Đăng ký nghệ sĩ đã được duyệt",
            "Chúc mừng! Bạn đã được duyệt trở thành nghệ sĩ. Bạn có thể bắt đầu đăng tải bài hát.",
            "ARTIST_VERIFICATION_APPROVED"
        );

        return saved;
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

        User saved = userRepository.save(user);
        String cleanedReason = reason != null ? reason.trim() : "";
        String message = cleanedReason.isBlank()
            ? "Đơn đăng ký nghệ sĩ của bạn đã bị từ chối. Bạn có thể cập nhật lại hồ sơ và gửi lại để xét duyệt."
            : ("Đơn đăng ký nghệ sĩ của bạn đã bị từ chối. Lý do: " + cleanedReason);

        notificationService.sendNotification(
            saved.getId(),
            "Đăng ký nghệ sĩ bị từ chối",
            message,
            "ARTIST_VERIFICATION_REJECTED"
        );

        return saved;
    }

    public User cancelArtistVerification(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getArtistVerification() == null) {
            throw new RuntimeException("No artist verification found");
        }

        String status = user.getArtistVerification().getStatus();
        if (!"pending".equals(status)) {
            throw new RuntimeException("Only pending artist verification can be cancelled");
        }

        user.setArtistVerification(null);
        user.setArtistPending(false);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }
    
    // ========== EMAIL VERIFICATION ==========
    
    public void verifyEmail(String token) {
        log.debug("Attempting to verify email with token={}", token);
        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    log.warn("Verification failed - token not found: {}", token);
                    return new RuntimeException("Invalid verification token");
                });

        if (verificationToken.isUsed()) {
            log.warn("Verification failed - token already used: {}", token);
            throw new RuntimeException("Token already used");
        }

        if (verificationToken.isExpired()) {
            log.warn("Verification failed - token expired: {}", token);
            throw new RuntimeException("Token expired");
        }

        if (verificationToken.getType() != VerificationToken.TokenType.EMAIL_VERIFICATION) {
            log.warn("Verification failed - invalid token type: {}", token);
            throw new RuntimeException("Invalid token type");
        }

        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> {
                    log.warn("Verification failed - user not found for token {} userId={}", token, verificationToken.getUserId());
                    return new RuntimeException("User not found");
                });

        user.setEmailVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
        log.info("Email verification succeeded for userId={} token={}", user.getId(), token);
    }
    
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }
        
        // Delete old tokens
        tokenRepository.deleteByUserId(user.getId());
        
        // Create and send new token
        String token = createVerificationToken(user, VerificationToken.TokenType.EMAIL_VERIFICATION);
        try {
            emailService.sendVerificationEmail(user.getEmail(), user.getUsername(), token);
        } catch (Exception e) {
            log.warn("Resend verification email failed for userId={} email={}", user.getId(), user.getEmail(), e);
            if (failOnVerificationEmailError) {
                throw e;
            }
        }
    }

    // Send a numeric verification code (6 digits) to the user's email and save it in a token
    public void sendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        // Delete old tokens for this user/email
        tokenRepository.deleteByUserId(user.getId());

        // Generate 6-digit code
        String code = String.format("%06d", (int) (Math.random() * 1000000));

        // Create token and attach code
        String token = createVerificationToken(user, VerificationToken.TokenType.EMAIL_VERIFICATION);
        VerificationToken vt = tokenRepository.findByToken(token).orElseThrow();
        vt.setCode(code);
        tokenRepository.save(vt);

        // Send code email
        try {
            emailService.sendVerificationCodeEmail(user.getEmail(), user.getUsername(), code);
        } catch (Exception e) {
            log.warn("sendVerificationCode: failed to send code to email={}", user.getEmail(), e);
            if (failOnVerificationEmailError) throw e;
        }
        log.info("Created verification code for email={} userId={} token={}", user.getEmail(), user.getId(), token);
    }

    // Verify using email + code
    public void verifyCode(String email, String code) {
        VerificationToken verificationToken = tokenRepository.findByEmailAndCodeAndType(email, code, VerificationToken.TokenType.EMAIL_VERIFICATION)
                .orElseThrow(() -> new RuntimeException("Invalid verification code"));

        if (verificationToken.isUsed()) {
            throw new RuntimeException("Code already used");
        }

        if (verificationToken.isExpired()) {
            throw new RuntimeException("Code expired");
        }

        User user = userRepository.findById(verificationToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setEmailVerified(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        verificationToken.setUsed(true);
        tokenRepository.save(verificationToken);
        log.info("Email verification by code succeeded for userId={} email={}", user.getId(), email);
    }
    
    // ========== PASSWORD RESET ==========
    
    public void sendPasswordResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Create reset token (expires in 1 hour)
        String token = createPasswordResetToken(user);
        emailService.sendPasswordResetEmail(user.getEmail(), user.getUsername(), token);
    }
    
    public void resetPassword(String token, String newPassword) {
        VerificationToken resetToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid reset token"));
        
        if (resetToken.isUsed()) {
            throw new RuntimeException("Token already used");
        }
        
        if (resetToken.isExpired()) {
            throw new RuntimeException("Token expired");
        }
        
        if (resetToken.getType() != VerificationToken.TokenType.PASSWORD_RESET) {
            throw new RuntimeException("Invalid token type");
        }
        
        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
        
        // Send confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getUsername());
    }
    
    public void changePassword(String userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (!passwordEncoder.matches(oldPassword, user.getPasswordHash())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        
        // Send confirmation email
        emailService.sendPasswordChangedEmail(user.getEmail(), user.getUsername());
    }
    
    // ========== HELPER METHODS ==========
    
    private String createVerificationToken(User user, VerificationToken.TokenType type) {
        String token = UUID.randomUUID().toString();
        
        VerificationToken verificationToken = new VerificationToken();
        verificationToken.setToken(token);
        verificationToken.setUserId(user.getId());
        verificationToken.setEmail(user.getEmail());
        verificationToken.setType(type);
        verificationToken.setCreatedAt(LocalDateTime.now());
        verificationToken.setExpiresAt(LocalDateTime.now().plusHours(24)); // 24 hours
        verificationToken.setUsed(false);
        
        tokenRepository.save(verificationToken);
        // Log token creation for debugging (appears in service console)
        log.info("Created verification token={} for userId={} email={}", token, user.getId(), user.getEmail());
        return token;
    }
    
    private String createPasswordResetToken(User user) {
        String token = UUID.randomUUID().toString();
        
        VerificationToken resetToken = new VerificationToken();
        resetToken.setToken(token);
        resetToken.setUserId(user.getId());
        resetToken.setEmail(user.getEmail());
        resetToken.setType(VerificationToken.TokenType.PASSWORD_RESET);
        resetToken.setCreatedAt(LocalDateTime.now());
        resetToken.setExpiresAt(LocalDateTime.now().plusHours(1)); // 1 hour
        resetToken.setUsed(false);
        
        tokenRepository.save(resetToken);
        return token;
    }
}


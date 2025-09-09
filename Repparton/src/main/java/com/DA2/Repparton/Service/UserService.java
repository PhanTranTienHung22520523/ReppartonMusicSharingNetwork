package com.DA2.Repparton.Service;

import com.DA2.Repparton.DTO.ProfileDTO;
import com.DA2.Repparton.DTO.RegisterRequestDTO;
import com.DA2.Repparton.DTO.UpdateProfileRequestDTO;
import com.DA2.Repparton.Entity.Song;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Repository.FollowRepo;
import com.DA2.Repparton.Repository.SongRepo;
import com.DA2.Repparton.Repository.UserRepo;
import com.DA2.Repparton.Security.JwtAuthenticationFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    @Autowired
    private UserRepo userRepository;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private FollowRepo followRepo;

    @Autowired
    private SongRepo songRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private NotificationService notificationService;

    @Transactional
    public Optional<User> register(RegisterRequestDTO request) {
        // Input validation
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            log.warn("Password confirmation mismatch for email: {}", request.getEmail());
            return Optional.empty();
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            log.warn("User already exists with email: {}", request.getEmail());
            return Optional.empty();
        }

        // Validate password strength
        if (!isValidPassword(request.getPassword())) {
            log.warn("Weak password provided for email: {}", request.getEmail());
            return Optional.empty();
        }

        String avatarUrl = null;
        String coverUrl = null;

        try {
            // Upload avatar if provided
            if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
                avatarUrl = cloudinaryService.uploadFile(request.getAvatarUrl());
            }

            // Upload cover if provided
            if (request.getCoverUrl() != null && !request.getCoverUrl().isEmpty()) {
                coverUrl = cloudinaryService.uploadFile(request.getCoverUrl());
            }
        } catch (IOException e) {
            log.error("Failed to upload user media for email: {}", request.getEmail(), e);
            return Optional.empty();
        }

        // Hash password
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User newUser = new User(request.getUsername(), request.getEmail(), hashedPassword);
        newUser.setFullName(request.getFullName()); // Set fullName from request
        newUser.setAvatarUrl(avatarUrl);
        newUser.setCoverUrl(coverUrl);
        newUser.setBio(request.getBio());
        newUser.setRole(request.getRole() != null ? request.getRole().toLowerCase() : "user"); // Use role from request
        newUser.setArtistPending(false);
        newUser.setCreatedAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);
        log.info("User registered successfully with email: {}", request.getEmail());

        return Optional.of(savedUser);
    }

    public Optional<String> login(String email, String password) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("Login attempt with non-existent email: {}", email);
            return Optional.empty();
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            log.warn("Invalid password for email: {}", email);
            return Optional.empty();
        }

        String token = jwtAuthenticationFilter.generateToken(user.getEmail());
        log.info("User logged in successfully: {}", email);

        return Optional.of(token);
    }

    @Cacheable(value = "users", key = "#id")
    public Optional<User> getById(String id) {
        return userRepository.findById(id);
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }
    
    public User findById(String id) {
        return userRepository.findById(id).orElse(null);
    }

    @Cacheable(value = "profiles", key = "#id")
    public ProfileDTO getProfile(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        long followerNumber = followRepo.countByArtistId(id);
        long followingNumber = followRepo.countByFollowerId(id);
        List<Song> songs = songRepo.findByArtistId(id);

        return new ProfileDTO(user, followerNumber, followingNumber, songs);
    }

    @Transactional
    public Optional<User> updateProfile(String userId, UpdateProfileRequestDTO request) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        try {
            // Update avatar if provided
            if (request.getAvatarUrl() != null && !request.getAvatarUrl().isEmpty()) {
                String avatarUrl = cloudinaryService.uploadFile(request.getAvatarUrl());
                user.setAvatarUrl(avatarUrl);
            }

            // Update cover if provided
            if (request.getCoverUrl() != null && !request.getCoverUrl().isEmpty()) {
                String coverUrl = cloudinaryService.uploadFile(request.getCoverUrl());
                user.setCoverUrl(coverUrl);
            }

            // Update other fields
            if (request.getUsername() != null) {
                user.setUsername(request.getUsername());
            }
            if (request.getBio() != null) {
                user.setBio(request.getBio());
            }

            User savedUser = userRepository.save(user);
            log.info("Profile updated for user: {}", userId);

            return Optional.of(savedUser);
        } catch (IOException e) {
            log.error("Failed to update profile for user: {}", userId, e);
            return Optional.empty();
        }
    }

    @Transactional
    public Optional<User> applyToBeArtist(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        // Check if already artist or pending
        if ("artist".equals(user.getRole()) || user.isArtistPending()) {
            return Optional.empty();
        }

        user.setArtistPending(true);
        User savedUser = userRepository.save(user);

        // Notify admins about new artist application
        // Tạm thời comment out vì method notifyAdmins không tồn tại
        // notificationService.notifyAdmins("New artist application from: " + user.getUsername(), "ARTIST_APPLICATION", userId);
        log.info("New artist application from: {}", user.getUsername());

        log.info("User {} applied to be artist", userId);
        return Optional.of(savedUser);
    }

    @Transactional
    public Optional<User> approveArtistRequest(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);

        if (userOpt.isEmpty()) return Optional.empty();

        User user = userOpt.get();

        // Only process if user is pending approval
        if (!user.isArtistPending() || "artist".equals(user.getRole())) {
            return Optional.empty();
        }

        user.setRole("artist");
        user.setArtistPending(false);

        User savedUser = userRepository.save(user);

        // Notify user about approval
        notificationService.sendNotification(userId, "Your artist application has been approved!", "ARTIST_APPROVED", null);

        log.info("Artist request approved for user: {}", userId);
        return Optional.of(savedUser);
    }

    public List<User> searchUsers(String query) {
        // Search by username or fullName containing the query (case insensitive)
        return userRepository.findByUsernameContainingIgnoreCaseOrFullNameContainingIgnoreCase(query, query);
    }
    
    public List<User> getPendingArtistRequests() {
        // Get all users who are pending artist approval
        return userRepository.findByIsArtistPending(true);
    }
    
    // Search users by username, email, or fullName
    public List<User> searchUsers(String query, int page, int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            
            // Search by username, email, or fullName containing the query (case insensitive)
            return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrFullNameContainingIgnoreCase(
                query, query, query, pageable
            ).getContent();
        } catch (Exception e) {
            log.error("Error searching users with query: {}", query, e);
            return List.of();
        }
    }

    private boolean isValidPassword(String password) {
        // Password must be at least 6 characters
        return password != null && password.length() >= 6;
    }
}

package com.DA2.userservice.service;

import com.DA2.userservice.dto.UserResponse;
import com.DA2.userservice.entity.User;
import com.DA2.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminService {
    
    private final UserRepository userRepository;

    private static boolean hasAdminRole(User user) {
        if (user == null) return false;

        // Check roles list (preferred). Be defensive: roles may sometimes be stored
        // as strings ("ADMIN"), or as maps/objects when deserialized from MongoDB.
        if (user.getRoles() != null) {
            for (Object ro : user.getRoles()) {
                if (ro == null) continue;

                // If it's already a String
                if (ro instanceof String) {
                    String r = ((String) ro).trim();
                    if ("ADMIN".equalsIgnoreCase(r) || "ROLE_ADMIN".equalsIgnoreCase(r)) {
                        return true;
                    }
                    continue;
                }

                // If it's a map-like object (e.g., deserialized {"authority":"ADMIN"})
                try {
                    String s = ro.toString();
                    if (s != null) {
                        if (s.contains("ADMIN") || s.contains("ROLE_ADMIN")) {
                            return true;
                        }
                    }
                } catch (Exception ignored) {
                }
            }
        }

        // Fallback to legacy single role field
        String role = user.getRole();
        if (role != null) {
            String trimmed = role.trim();
            if ("ADMIN".equalsIgnoreCase(trimmed) || "ROLE_ADMIN".equalsIgnoreCase(trimmed)) {
                return true;
            }
        }

        return false;
    }
    
    // Verify admin role
    private void verifyAdmin(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("Admin not found");
        }
        User user = userOpt.get();
        if (!hasAdminRole(user)) {
            throw new RuntimeException("Unauthorized: Admin access required");
        }
    }
    
    // ========== USER MANAGEMENT ==========
    
    public Page<UserResponse> getAllUsers(String adminId, Pageable pageable) {
        verifyAdmin(adminId);
        return userRepository.findAll(pageable)
                .map(this::toUserResponse);
    }
    
    public Page<UserResponse> searchUsers(String adminId, String keyword, Pageable pageable) {
        verifyAdmin(adminId);
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                keyword, keyword, pageable)
                .map(this::toUserResponse);
    }
    
    @Transactional
    public User banUser(String adminId, String userId, String reason) {
        verifyAdmin(adminId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        if (hasAdminRole(user)) {
            throw new RuntimeException("Cannot ban admin users");
        }
        
        user.setBanned(true);
        user.setBanReason(reason);
        user.setBannedAt(LocalDateTime.now());
        user.setBannedBy(adminId);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    @Transactional
    public User unbanUser(String adminId, String userId) {
        verifyAdmin(adminId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        user.setBanned(false);
        user.setBanReason(null);
        user.setBannedAt(null);
        user.setBannedBy(null);
        user.setUpdatedAt(LocalDateTime.now());
        
        return userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(String adminId, String userId) {
        verifyAdmin(adminId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        if (hasAdminRole(user)) {
            throw new RuntimeException("Cannot delete admin users");
        }
        
        userRepository.delete(user);
    }
    
    public Map<String, Object> getUserActivity(String adminId, String userId) {
        verifyAdmin(adminId);
        
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        
        User user = userOpt.get();
        Map<String, Object> activity = new HashMap<>();
        activity.put("userId", user.getId());
        activity.put("username", user.getUsername());
        activity.put("email", user.getEmail());
        activity.put("createdAt", user.getCreatedAt());
        activity.put("lastLoginAt", user.getLastLoginAt());
        activity.put("isVerified", user.isVerified());
        activity.put("isBanned", user.isBanned());
        activity.put("roles", user.getRoles());
        
        return activity;
    }
    
    // ========== ARTIST VERIFICATION ==========
    
    public Page<User> getPendingArtists(String adminId, Pageable pageable) {
        verifyAdmin(adminId);
        return userRepository.findByArtistVerificationStatus("pending", pageable);
    }
    
    public Page<User> getApprovedArtists(String adminId, Pageable pageable) {
        verifyAdmin(adminId);
        return userRepository.findByArtistVerificationStatus("approved", pageable);
    }
    
    public Page<User> getRejectedArtists(String adminId, Pageable pageable) {
        verifyAdmin(adminId);
        return userRepository.findByArtistVerificationStatus("rejected", pageable);
    }
    
    // ========== SYSTEM STATISTICS ==========
    
    public Map<String, Object> getSystemStats(String adminId) {
        verifyAdmin(adminId);
        
        long totalUsers = userRepository.count();
        long verifiedUsers = userRepository.countByAnyVerifiedTrue();
        long bannedUsers = userRepository.countByIsBannedTrue();
        long totalArtists = userRepository.countByRoleOrRoles("ARTIST");

        long pendingArtists = userRepository.countByArtistVerificationStatus("pending");
        long approvedArtists = userRepository.countByArtistVerificationStatus("approved");
        long rejectedArtists = userRepository.countByArtistVerificationStatus("rejected");
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("verifiedUsers", verifiedUsers);
        stats.put("bannedUsers", bannedUsers);
        // Keep both keys for backwards compatibility with any clients
        stats.put("artistCount", totalArtists);
        stats.put("totalArtists", totalArtists);
        stats.put("pendingArtists", pendingArtists);
        stats.put("approvedArtists", approvedArtists);
        stats.put("rejectedArtists", rejectedArtists);
        stats.put("timestamp", LocalDateTime.now());
        
        return stats;
    }
    
    public Map<String, Object> getUserStats(String adminId) {
        verifyAdmin(adminId);
        
        long totalUsers = userRepository.count();
        long activeUsers = totalUsers; // TODO: Define "active" criteria
        long newUsersToday = 0; // TODO: Count users created today
        long newUsersThisWeek = 0; // TODO: Count users created this week
        long newUsersThisMonth = 0; // TODO: Count users created this month
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("activeUsers", activeUsers);
        stats.put("newUsersToday", newUsersToday);
        stats.put("newUsersThisWeek", newUsersThisWeek);
        stats.put("newUsersThisMonth", newUsersThisMonth);
        stats.put("timestamp", LocalDateTime.now());
        
        return stats;
    }
    
    // Helper method
    private UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .coverUrl(user.getCoverUrl())
                .bio(user.getBio())
                .role(user.getRole())
                .verified(user.isVerified())
                .artistPending(user.isArtistPending())
                .followersCount(user.getFollowersCount())
                .followingCount(user.getFollowingCount())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}

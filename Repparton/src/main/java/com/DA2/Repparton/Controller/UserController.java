package com.DA2.Repparton.Controller;

import com.DA2.Repparton.DTO.ProfileDTO;
import com.DA2.Repparton.DTO.RegisterRequestDTO;
import com.DA2.Repparton.DTO.UpdateProfileRequestDTO;
import com.DA2.Repparton.Entity.User;
import com.DA2.Repparton.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequestDTO request) {
        try {
            Optional<User> user = userService.register(request);
            if (user.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "User registered successfully");
                response.put("user", user.get());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Registration failed. Check your input data."
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String password = request.get("password");
            
            Optional<String> token = userService.login(email, password);
            if (token.isPresent()) {
                // Get user info to return with token
                Optional<User> userOpt = Optional.ofNullable(userService.findByEmail(email));
                
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("token", token.get());
                
                if (userOpt.isPresent()) {
                    response.put("user", userOpt.get());
                }
                
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Invalid email or password"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "message", "Error: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            Optional<User> user = userService.getById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<?> getUserProfile(@PathVariable String id) {
        try {
            ProfileDTO profile = userService.getProfile(id);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(@PathVariable String id,
                                         @RequestBody UpdateProfileRequestDTO request,
                                         Authentication auth) {
        try {
            String currentUserId = getCurrentUserId(auth);
            if (!id.equals(currentUserId)) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            Optional<User> updatedUser = userService.updateProfile(id, request);
            if (updatedUser.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", updatedUser.get()
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to update profile"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/apply-artist")
    public ResponseEntity<?> applyToBeArtist(@PathVariable String id, Authentication auth) {
        try {
            String currentUserId = getCurrentUserId(auth);
            if (!id.equals(currentUserId)) {
                return ResponseEntity.status(403).body("Unauthorized");
            }

            Optional<User> user = userService.applyToBeArtist(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Artist application submitted successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to submit artist application"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/approve-artist")
    public ResponseEntity<?> approveArtistRequest(@PathVariable String id, Authentication auth) {
        try {
            // Only admins can approve artist requests
            String currentUserId = getCurrentUserId(auth);
            User currentUser = userService.getById(currentUserId).orElse(null);
            if (currentUser == null || !"admin".equals(currentUser.getRole())) {
                return ResponseEntity.status(403).body("Admin access required");
            }

            Optional<User> user = userService.approveArtistRequest(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Artist request approved successfully"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to approve artist request"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam String query) {
        try {
            List<User> users = userService.searchUsers(query);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/pending-artists")
    public ResponseEntity<?> getPendingArtistRequests(Authentication auth) {
        try {
            // Only admins can view pending artist requests
            String currentUserId = getCurrentUserId(auth);
            User currentUser = userService.getById(currentUserId).orElse(null);
            if (currentUser == null || !"admin".equals(currentUser.getRole())) {
                return ResponseEntity.status(403).body("Admin access required");
            }

            List<User> pendingUsers = userService.getPendingArtistRequests();
            return ResponseEntity.ok(pendingUsers);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    private String getCurrentUserId(Authentication auth) {
        // Extract user ID from JWT token
        // For now, return a placeholder
        return "current-user-id";
    }

    // Request DTOs
    public static class LoginRequest {
        public String email;
        public String password;
    }
}

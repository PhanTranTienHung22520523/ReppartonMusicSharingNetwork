package com.DA2.userservice.config;

import com.DA2.userservice.entity.User;
import com.DA2.userservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

/**
 * Optional dev bootstrap for ensuring an admin user exists.
 *
 * Enable via:
 * - app.bootstrap.admin.enabled=true
 * - app.bootstrap.admin.password=... (required)
 *
 * You can also override username/email via:
 * - app.bootstrap.admin.username
 * - app.bootstrap.admin.email
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AdminBootstrap implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap.admin.enabled:false}")
    private boolean enabled;

    @Value("${app.bootstrap.admin.username:admin}")
    private String username;

    @Value("${app.bootstrap.admin.email:admin@repparton.local}")
    private String email;

    @Value("${app.bootstrap.admin.password:}")
    private String password;

    @Override
    public void run(String... args) {
        if (!enabled) {
            return;
        }

        if (password == null || password.isBlank()) {
            log.warn("Admin bootstrap enabled but no password provided (app.bootstrap.admin.password). Skipping.");
            return;
        }

        Optional<User> existing = userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(email));

        User user = existing.orElseGet(() -> {
            User created = User.builder()
                    .username(username)
                    .email(email)
                    .passwordHash(passwordEncoder.encode(password))
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
            return created;
        });

        // Ensure admin roles are set consistently
        Set<String> roles = new LinkedHashSet<>();
        if (user.getRoles() != null) {
            roles.addAll(user.getRoles());
        }
        roles.add("ADMIN");
        // Keep USER for compatibility with code paths that assume USER exists
        roles.add("USER");

        user.setRole("ADMIN");
        user.setRoles(new ArrayList<>(roles));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);

        log.info("Admin bootstrap ensured admin user exists: username={} email={}", username, email);
    }
}

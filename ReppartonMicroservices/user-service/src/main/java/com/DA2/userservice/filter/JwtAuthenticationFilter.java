package com.DA2.userservice.filter;

import com.DA2.userservice.entity.User;
import com.DA2.userservice.repository.UserRepository;
import com.DA2.userservice.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    private static String normalizeRole(String role) {
        if (role == null) return null;
        String trimmed = role.trim();
        if (trimmed.isEmpty()) return null;
        return trimmed.startsWith("ROLE_") ? trimmed.substring("ROLE_".length()) : trimmed;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (logger.isDebugEnabled()) {
            logger.debug(
                    "JWT filter: " + request.getMethod() + " " + request.getRequestURI() +
                            " authHeaderPresent=" + (authHeader != null)
            );
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // Extract userId from token
                String userId = jwtUtil.validateToken(token);

                if (logger.isDebugEnabled()) {
                    logger.debug("JWT filter: token subject(userId)=" + userId);
                }

                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // Load user from database to get actual roles
                    User user = userRepository.findById(userId).orElse(null);

                    if (logger.isDebugEnabled()) {
                        if (user == null) {
                            logger.debug("JWT filter: user not found by id=" + userId + ", defaulting to USER");
                        } else {
                            logger.debug(
                                    "JWT filter: user found id=" + user.getId() +
                                            " username=" + user.getUsername() +
                                            " roleField=" + user.getRole() +
                                            " rolesList=" + user.getRoles()
                            );
                        }
                    }
                    
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();
                    
                    if (user != null) {
                        // Build an effective role set from both `roles` list and legacy `role` field.
                        // Some users may have role="ADMIN" but roles=["USER"], which would otherwise drop ROLE_ADMIN.
                        Set<String> effectiveRoles = new LinkedHashSet<>();

                        if (user.getRoles() != null) {
                            for (String r : user.getRoles()) {
                                String normalized = normalizeRole(r);
                                if (normalized != null) effectiveRoles.add(normalized);
                            }
                        }

                        String legacyRole = normalizeRole(user.getRole());
                        if (legacyRole != null) {
                            effectiveRoles.add(legacyRole);
                        }

                        if (effectiveRoles.isEmpty()) {
                            effectiveRoles.add("USER");
                        }

                        if (logger.isDebugEnabled()) {
                            logger.debug("JWT filter: effectiveRoles=" + effectiveRoles);
                        }

                        authorities.addAll(
                                effectiveRoles.stream()
                                        .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                                        .collect(Collectors.toList())
                        );
                    } else {
                        // User not found, default to USER role
                        authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    }

                    // Set authentication with actual roles
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userId, 
                                    null, 
                                    authorities
                            );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception e) {
                logger.error("Cannot set user authentication: " + e.getMessage(), e);
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}

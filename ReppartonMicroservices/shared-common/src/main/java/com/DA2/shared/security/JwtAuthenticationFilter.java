package com.DA2.shared.security;

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
import java.util.Collections;
import java.util.List;

/**
 * Basic JWT Authentication Filter for microservices that don't need to load user details.
 * This filter validates JWT tokens and sets userId in security context.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
                // QUICK WORKAROUND: allow unauthenticated GETs to report endpoints by injecting an admin auth.
                // Temporary measure while reports rollout is finishing.
                String reqUri = request.getRequestURI();
                if ("GET".equalsIgnoreCase(request.getMethod()) && reqUri != null && reqUri.startsWith("/api/reports")) {
                    if (logger.isDebugEnabled()) logger.debug("JWT filter: bypassing auth for GET " + reqUri + " - injecting temporary ROLE_ADMIN");
                    java.util.List<SimpleGrantedAuthority> tmp = Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken("__reports_get_fallback__", null, tmp);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    filterChain.doFilter(request, response);
                    return;
                }
            String token = extractTokenFromRequest(request);

            String userId = null;

            // Preferred: validate JWT
            if (token != null) {
                userId = jwtUtil.validateToken(token);
            }

            // Fallback: trust gateway-provided identity if marked
            if (userId == null) {
                String gatewayAuth = request.getHeader("X-Gateway-Auth");
                String forwardedUserId = request.getHeader("X-User-Id");
                if ("true".equalsIgnoreCase(gatewayAuth) && forwardedUserId != null && !forwardedUserId.isBlank()) {
                    userId = forwardedUserId;
                }
            }

            if (userId != null) {
                // Try to extract roles claim from token and map to authorities.
                java.util.List<String> rolesFromToken = java.util.List.of();
                try {
                    rolesFromToken = jwtUtil.getRolesFromToken(token);
                } catch (Exception e) {
                    logger.debug("JWT filter: cannot read roles from token: " + e.getMessage());
                }

                java.util.List<SimpleGrantedAuthority> authorities;
                if (rolesFromToken != null && !rolesFromToken.isEmpty()) {
                    if (logger.isDebugEnabled()) {
                        logger.debug("JWT filter: rolesFromToken=" + rolesFromToken);
                    }
                    authorities = new java.util.ArrayList<>();
                    for (String r : rolesFromToken) {
                        if (r == null) continue;
                        String norm = r.trim();
                        if (norm.isEmpty()) continue;
                        // Accept values like "ADMIN" or "ROLE_ADMIN"
                        if (norm.toUpperCase().startsWith("ROLE_")) {
                            authorities.add(new SimpleGrantedAuthority(norm.toUpperCase()));
                        } else {
                            authorities.add(new SimpleGrantedAuthority("ROLE_" + norm.toUpperCase()));
                        }
                    }
                } else {
                    // No roles in token — try to read forwarded roles from headers (gateway/dev)
                    String headerRoles = request.getHeader("X-User-Roles");
                    if (headerRoles != null && !headerRoles.isBlank()) {
                        if (logger.isDebugEnabled()) logger.debug("JWT filter: roles not in token, using X-User-Roles header: " + headerRoles);
                        java.util.List<String> parsed = new java.util.ArrayList<>();
                        // header may be CSV or JSON array-like
                        String s = headerRoles.replace("[", "").replace("]", "").trim();
                        if (!s.isEmpty()) {
                            String[] parts = s.split("\\s*,\\s*");
                            for (String p : parts) if (!p.isBlank()) parsed.add(p);
                        }
                        authorities = new java.util.ArrayList<>();
                        for (String r : parsed) {
                            String norm = r.trim(); if (norm.isEmpty()) continue;
                            if (norm.toUpperCase().startsWith("ROLE_")) authorities.add(new SimpleGrantedAuthority(norm.toUpperCase()));
                            else authorities.add(new SimpleGrantedAuthority("ROLE_" + norm.toUpperCase()));
                        }
                    } else {
                        // Default to ROLE_USER when no roles present anywhere
                        authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"));
                        if (logger.isDebugEnabled()) {
                            logger.debug("JWT filter: no roles found in token or headers, defaulting to ROLE_USER");
                        }
                    }
                }

                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(userId, null, authorities);

                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Set userId in request attribute for backward compatibility
                request.setAttribute("userId", userId);
            }
            else {
                // token was null or invalid — try to accept gateway-provided identity
                String forwardedUser = request.getHeader("X-User-Id");
                String gatewayAuth = request.getHeader("X-Gateway-Auth");
                if (forwardedUser != null && ("true".equalsIgnoreCase(gatewayAuth) || request.getHeader("Authorization") == null)) {
                    if (logger.isDebugEnabled()) logger.debug("JWT filter: no token, using forwarded X-User-Id=" + forwardedUser);
                    // read roles from header if provided
                    String headerRoles = request.getHeader("X-User-Roles");
                    java.util.List<SimpleGrantedAuthority> authorities = new java.util.ArrayList<>();
                    if (headerRoles != null && !headerRoles.isBlank()) {
                        String s = headerRoles.replace("[", "").replace("]", "").trim();
                        if (!s.isEmpty()) {
                            String[] parts = s.split("\\s*,\\s*");
                            for (String p : parts) {
                                String norm = p.trim(); if (norm.isEmpty()) continue;
                                if (norm.toUpperCase().startsWith("ROLE_")) authorities.add(new SimpleGrantedAuthority(norm.toUpperCase()));
                                else authorities.add(new SimpleGrantedAuthority("ROLE_" + norm.toUpperCase()));
                            }
                        }
                    }
                    if (authorities.isEmpty()) authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(forwardedUser, null, authorities);
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    request.setAttribute("userId", forwardedUser);
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}

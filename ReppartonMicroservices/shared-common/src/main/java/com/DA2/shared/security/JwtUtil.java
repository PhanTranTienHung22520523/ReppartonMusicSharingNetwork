package com.DA2.shared.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {
    
    // Use `jwt.secret` when explicitly configured; otherwise fall back to `.env` `JWT_SECRET`.
    @Value("${jwt.secret:${JWT_SECRET:repparton-secret-key-2025-very-long-and-secure-key-please-change-1234567890}}")
    private String jwtSecret;
    
    @Value("${jwt.access-token-expiration:3600000}") // 1 hour
    private long accessTokenExpiration;
    
    @Value("${jwt.refresh-token-expiration:604800000}") // 7 days
    private long refreshTokenExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpiration);

        return Jwts.builder()
                .setSubject(userId)
                .claim("username", username)
                .claim("type", "access")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String generateRefreshToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpiration);

        return Jwts.builder()
                .setSubject(userId)
                .claim("type", "refresh")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    public String validateRefreshToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String tokenType = claims.get("type", String.class);
            if (!"refresh".equals(tokenType)) {
                throw new RuntimeException("Invalid token type");
            }
            
            return claims.getSubject();
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    public String validateToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            return claims.getSubject(); // Returns userId
        } catch (Exception e) {
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }

    public String getUserIdFromToken(String token) {
        return validateToken(token);
    }

    public String getUsernameFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            return claims.get("username", String.class);
        } catch (Exception e) {
            throw new RuntimeException("Invalid token: " + e.getMessage());
        }
    }

    /**
     * Try to extract roles claim from token. Supports roles as List or comma-separated String.
     */
    @SuppressWarnings("unchecked")
    public java.util.List<String> getRolesFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();

            Object rolesObj = claims.get("roles");
            if (rolesObj == null) {
                // try single legacy claim 'role'
                Object roleObj = claims.get("role");
                if (roleObj != null) {
                    return java.util.List.of(roleObj.toString());
                }
                return java.util.List.of();
            }

            if (rolesObj instanceof java.util.List) {
                java.util.List<?> raw = (java.util.List<?>) rolesObj;
                java.util.List<String> out = new java.util.ArrayList<>();
                for (Object o : raw) {
                    if (o != null) out.add(o.toString());
                }
                return out;
            }

            // If it's a string like "ADMIN,USER" or "[ADMIN]"
            String s = rolesObj.toString();
            s = s.replace("[", "").replace("]", "").trim();
            if (s.isEmpty()) return java.util.List.of();
            String[] parts = s.split("\\s*,\\s*");
            java.util.List<String> out = new java.util.ArrayList<>();
            for (String p : parts) if (!p.isBlank()) out.add(p);
            return out;
        } catch (Exception e) {
            throw new RuntimeException("Cannot parse roles from token: " + e.getMessage());
        }
    }
}

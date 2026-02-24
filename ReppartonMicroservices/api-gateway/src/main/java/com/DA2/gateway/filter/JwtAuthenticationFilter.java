package com.DA2.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

@Component
public class JwtAuthenticationFilter extends AbstractGatewayFilterFactory<JwtAuthenticationFilter.Config> {

    // Use `jwt.secret` when explicitly configured; otherwise fall back to `.env` `JWT_SECRET`.
    @Value("${jwt.secret:${JWT_SECRET:repparton-secret-key-2025-very-long-and-secure-key-please-change-1234567890}}")
    private String jwtSecret;

    public JwtAuthenticationFilter() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();
            HttpMethod method = request.getMethod();

            System.out.println("=== JWT Filter Debug ===");
            System.out.println("Path: " + path);
            System.out.println("Method: " + method);

            if (HttpMethod.OPTIONS.equals(method)) {
                System.out.println("Skipping OPTIONS request");
                return chain.filter(exchange);
            }
            
            // Skip authentication for login and register endpoints
            if (path.contains("/auth/login") || path.contains("/auth/register") || 
                path.contains("/auth/refresh") || path.contains("/health") ||
                path.contains("/swagger") || path.contains("/v3/api-docs") ||
                // Social service public endpoints
                (path.contains("/api/social/followers") && HttpMethod.GET.equals(method)) ||
                (path.contains("/api/social/following") && HttpMethod.GET.equals(method)) ||
                (path.contains("/api/social/stats") && HttpMethod.GET.equals(method)) ||
                (path.contains("/api/social/is-following") && HttpMethod.GET.equals(method)) ||
                (path.contains("/api/social/likes/count") && HttpMethod.GET.equals(method)) ||
                (path.contains("/api/social/shares/count") && HttpMethod.GET.equals(method))) {
                System.out.println("Skipping public endpoint: " + path);
                return chain.filter(exchange);
            }

            String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            System.out.println("Auth header: " + (authHeader != null ? "Present" : "Missing"));

            // WebSocket clients cannot set custom headers in the browser.
            // Support passing JWT as query param (?token=...) for WS handshake and other cases.
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                String tokenParam = request.getQueryParams().getFirst("token");
                if (tokenParam != null && !tokenParam.isBlank()) {
                    String rawToken = tokenParam.startsWith("Bearer ") ? tokenParam.substring(7) : tokenParam;
                    authHeader = "Bearer " + rawToken;
                    System.out.println("Auth header derived from query param token");
                }
            }
            
            // This filter is only attached to protected routes in application.yml.
            // If the header is missing/invalid, reject the request.
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                System.out.println("Missing/invalid auth header, rejecting");
                return onError(exchange, "Missing or invalid Authorization header", HttpStatus.UNAUTHORIZED);
            }

            String token = authHeader.substring(7);
            
            try {
                SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
                Claims claims = Jwts.parserBuilder()
                        .setSigningKey(key)
                        .build()
                        .parseClaimsJws(token)
                        .getBody();

                String userId = claims.getSubject();
                String username = claims.get("username", String.class);

                // Add user info to request headers for downstream services
                ServerHttpRequest modifiedRequest = request.mutate()
                    // Explicitly preserve Authorization header for downstream JWT filters
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                        .header("X-User-Id", userId)
                        .header("X-Username", username)
                        .header("X-Gateway-Auth", "true")
                        .build();

                return chain.filter(exchange.mutate().request(modifiedRequest).build());

            } catch (Exception e) {
                return onError(exchange, "Invalid JWT token", HttpStatus.UNAUTHORIZED);
            }
        };
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(httpStatus);
        return response.setComplete();
    }

    public static class Config {
        // Configuration properties if needed
    }
}

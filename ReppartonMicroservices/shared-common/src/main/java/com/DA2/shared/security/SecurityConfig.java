package com.DA2.shared.security;

import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Base Security Configuration for microservices with JWT authentication.
 * Services can extend this or use it as-is.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .httpBasic(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/health",
                    "/actuator/**",
                    "/api/files/**",
                    "/api/*/public/**",
                    "/api/auth/**",
                    "/api/users/search"
                ).permitAll()
                // Allow internal services (e.g., search-service) to record analytics events.
                // This keeps searches from failing to record when requests are not carrying a JWT.
                .requestMatchers(HttpMethod.POST, "/api/analytics/search-history").permitAll()
                // Permit anonymous GET to public story endpoints
                .requestMatchers(HttpMethod.GET,
                    "/api/stories/all",
                    "/api/stories/user/*/public",
                    "/api/stories/uploads/**",
                    "/api/stories/uploaded/**"
                ).permitAll()
                // Permit anonymous GET to comment endpoints
                .requestMatchers(HttpMethod.GET,
                    "/api/comments",
                    "/api/comments/**"
                ).permitAll()
                // Permit anonymous GET to user profiles
                .requestMatchers(HttpMethod.GET, "/api/users/*/profile").permitAll()
                // Permit anonymous GET to social endpoints for followers/following/stats
                .requestMatchers(HttpMethod.GET, "/api/social/**").permitAll()
                // Permit anonymous GET to artist groups (browse)
                .requestMatchers(HttpMethod.GET, "/api/artist-groups/**").permitAll()
                // Permit anonymous GET to group conversations browse + pinned groups on profiles
                .requestMatchers(HttpMethod.GET,
                    "/api/groups/public",
                    "/api/groups/public/**",
                    "/api/groups/pinned/**"
                ).permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:5173", 
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000"
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "X-User-Id", "X-Total-Count", "Content-Type"));
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}

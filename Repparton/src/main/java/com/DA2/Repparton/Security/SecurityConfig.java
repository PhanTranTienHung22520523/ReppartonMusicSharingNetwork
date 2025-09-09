package com.DA2.Repparton.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService,
                         JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/api/auth/**", "/api/users/register", "/api/users/login").permitAll()
                .requestMatchers("/api/songs/public/**", "/api/songs/trending", "/api/songs/search", "/api/songs/artist/**", "/api/songs/recent/**", "/api/genres/**").permitAll()
                .requestMatchers("/api/posts/public/**", "/api/posts/user/**", "/api/users/*/profile").permitAll()
                .requestMatchers("/api/search/**").permitAll() // Allow public search
                .requestMatchers("/api/playlists/public").permitAll() // Allow public playlists
                .requestMatchers("/api/playlists/**").hasAnyRole("USER", "ARTIST", "ADMIN") // Require auth for playlist management
                .requestMatchers("/api/notifications/**").permitAll() // Allow notification access
                .requestMatchers("/api/follow/**").permitAll() // Allow follow operations
                .requestMatchers("/api/likes/**").permitAll() // Allow like operations
                .requestMatchers("/api/comments/**").permitAll() // Allow comment operations
                .requestMatchers("/api/stories/public").permitAll() // Allow public story access
                .requestMatchers("/api/posts").hasAnyRole("USER", "ARTIST", "ADMIN") // Allow authenticated users to create posts
                .requestMatchers("/api/stories/**").hasAnyRole("USER", "ARTIST", "ADMIN") // Allow authenticated users to create stories
                .requestMatchers("/api/messages/**").hasRole("ARTIST") // Only artists can access messaging
                .requestMatchers("/ws/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/songs/upload", "/api/songs/approve").hasAnyRole("ARTIST", "ADMIN", "USER")
                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();

        // Sử dụng allowedOriginPatterns thay vì allowedOrigins để tránh xung đột với allowCredentials
        configuration.setAllowedOriginPatterns(java.util.Arrays.asList("http://localhost:5173", "http://localhost:3000"));
        configuration.setAllowedMethods(java.util.Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        configuration.setAllowCredentials(true);

        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

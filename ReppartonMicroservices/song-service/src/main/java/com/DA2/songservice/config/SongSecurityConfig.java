package com.DA2.songservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SongSecurityConfig {

    @Bean
    public SecurityFilterChain songSecurityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(AbstractHttpConfigurer::disable) // Disable CORS in downstream, let Gateway handle it
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/songs/**").permitAll() // Allow public access, Gateway handles protection
                .requestMatchers("/actuator/**").permitAll()
                .anyRequest().permitAll() // For now, allow all to ensure connectivity. Gateway handles Auth.
            );
        return http.build();
    }
}

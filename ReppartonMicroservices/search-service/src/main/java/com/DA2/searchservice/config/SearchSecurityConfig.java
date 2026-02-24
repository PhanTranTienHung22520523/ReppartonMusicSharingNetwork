package com.DA2.searchservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SearchSecurityConfig {

    @Bean
    public SecurityFilterChain searchSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable) // Let Gateway handle CORS
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/search/**").permitAll()
                        .requestMatchers("/actuator/**", "/health").permitAll()
                        .anyRequest().permitAll() // Gateway handles Auth
                );

        return http.build();
    }
}

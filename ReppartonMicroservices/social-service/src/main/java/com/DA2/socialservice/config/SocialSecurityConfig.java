package com.DA2.socialservice.config;

import com.DA2.shared.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SocialSecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SocialSecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain socialSecurityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .exceptionHandling(ex -> ex.authenticationEntryPoint(
                        (request, response, authException) -> response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
                ))
                .authorizeHttpRequests(auth -> auth
                        // Preflight
                        .requestMatchers(new AntPathRequestMatcher("/**", HttpMethod.OPTIONS.name())).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/actuator/**")).permitAll()
                        .requestMatchers(new AntPathRequestMatcher("/api/social/health")).permitAll()

                    .requestMatchers(new AntPathRequestMatcher("/api/social/is-following", HttpMethod.GET.name())).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/following/**", HttpMethod.GET.name())).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/followers/**", HttpMethod.GET.name())).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/stats/**", HttpMethod.GET.name())).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/likes/count", HttpMethod.GET.name())).permitAll()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/shares/count", HttpMethod.GET.name())).permitAll()

                    // User-specific like/share state requires auth
                    .requestMatchers(new AntPathRequestMatcher("/api/social/is-liked", HttpMethod.GET.name())).authenticated()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/likes/user/**", HttpMethod.GET.name())).authenticated()
                    .requestMatchers(new AntPathRequestMatcher("/api/social/shares/user/**", HttpMethod.GET.name())).authenticated()

                    // Everything else requires auth (mutations)
                    .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

package com.DA2.genreservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;

import com.DA2.shared.security.SecurityConfig;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableCaching
@ComponentScan(
    basePackages = {"com.DA2.genreservice", "com.DA2.shared"},
    excludeFilters = @ComponentScan.Filter(type = FilterType.ASSIGNABLE_TYPE, classes = SecurityConfig.class)
)
public class GenreServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(GenreServiceApplication.class, args);
    }
}
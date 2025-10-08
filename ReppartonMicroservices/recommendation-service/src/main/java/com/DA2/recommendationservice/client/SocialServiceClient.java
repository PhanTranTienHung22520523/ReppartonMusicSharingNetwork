package com.DA2.recommendationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "social-service")
public interface SocialServiceClient {
    
    @GetMapping("/api/social/following/{userId}")
    Object getFollowing(@PathVariable("userId") String userId);
}

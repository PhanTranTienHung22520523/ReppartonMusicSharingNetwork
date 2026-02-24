package com.DA2.recommendationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "ai-service", url = "${ai.service.url:http://localhost:5000}")
public interface AIServiceClient {

    @PostMapping("/api/ai/recommend/by-user")
    Map<String, Object> getRecommendationsByUser(@RequestBody Map<String, Object> request);
}

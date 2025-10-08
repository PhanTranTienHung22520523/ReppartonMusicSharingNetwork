package com.DA2.recommendationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "analytics-service")
public interface AnalyticsServiceClient {
    
    @GetMapping("/api/analytics/listen-history/user/{userId}")
    Object getUserListenHistory(@PathVariable("userId") String userId,
                               @RequestParam("limit") int limit);
}

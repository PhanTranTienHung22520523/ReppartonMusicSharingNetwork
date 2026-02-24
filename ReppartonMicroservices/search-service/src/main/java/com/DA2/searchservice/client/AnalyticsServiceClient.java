package com.DA2.searchservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "analytics-service")
public interface AnalyticsServiceClient {

    @PostMapping("/api/analytics/search-history")
    Object addSearchHistory(@RequestParam("userId") String userId, @RequestParam("query") String query);
}

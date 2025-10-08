package com.DA2.searchservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "post-service")
public interface PostServiceClient {
    
    @GetMapping("/api/posts/search")
    Object searchPosts(@RequestParam("query") String query,
                      @RequestParam("page") int page,
                      @RequestParam("size") int size);
}

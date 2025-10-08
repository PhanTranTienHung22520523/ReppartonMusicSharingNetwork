package com.DA2.searchservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    
    @GetMapping("/api/users/search")
    Object searchUsers(@RequestParam("query") String query, 
                      @RequestParam("page") int page,
                      @RequestParam("size") int size);
}

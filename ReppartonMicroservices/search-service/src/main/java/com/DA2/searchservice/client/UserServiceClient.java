package com.DA2.searchservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserServiceClient {
    
    @GetMapping("/api/users/search")
    Object searchUsers(@RequestParam("q") String query, 
                      @RequestParam("page") int page,
                      @RequestParam("size") int size);

    @GetMapping("/api/users/public/{userId}")
    Object getPublicUserById(@PathVariable("userId") String userId);
}

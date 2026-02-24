package com.DA2.messageservice.client;

import com.DA2.messageservice.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    // Public endpoint (no auth) used for displaying usernames/avatars + DM permission checks.
    @GetMapping("/api/users/public/{userId}")
    UserDTO getUserById(@PathVariable("userId") String userId);
}

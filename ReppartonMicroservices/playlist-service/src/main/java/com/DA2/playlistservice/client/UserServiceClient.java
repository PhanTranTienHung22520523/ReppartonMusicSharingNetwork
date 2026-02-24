package com.DA2.playlistservice.client;

import com.DA2.playlistservice.dto.UserProfileResponseDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service")
public interface UserServiceClient {

    @GetMapping("/api/users/{userId}/profile")
    UserProfileResponseDTO getUserProfile(@PathVariable("userId") String userId);
}

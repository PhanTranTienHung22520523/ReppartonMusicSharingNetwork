package com.DA2.searchservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "playlist-service")
public interface PlaylistServiceClient {
    
    @GetMapping("/api/playlists/search")
    Object searchPlaylists(@RequestParam("query") String query,
                          @RequestParam("page") int page,
                          @RequestParam("size") int size);
}

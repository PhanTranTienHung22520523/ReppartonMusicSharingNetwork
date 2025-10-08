package com.DA2.recommendationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "song-service")
public interface SongServiceClient {
    
    @GetMapping("/api/songs/{songId}")
    Object getSongById(@PathVariable("songId") String songId);
    
    @GetMapping("/api/songs/genre/{genreId}")
    Object getSongsByGenre(@PathVariable("genreId") String genreId);
}

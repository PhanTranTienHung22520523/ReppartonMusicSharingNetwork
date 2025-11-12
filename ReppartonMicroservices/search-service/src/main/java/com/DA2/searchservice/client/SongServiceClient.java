package com.DA2.searchservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "song-service")
public interface SongServiceClient {

    @GetMapping("/api/songs/search")
    Object searchSongs(@RequestParam("query") String query,
                      @RequestParam("page") int page,
                      @RequestParam("size") int size);

    @GetMapping("/api/songs/search/lyrics")
    Object searchLyrics(@RequestParam("query") String query,
                       @RequestParam("page") int page,
                       @RequestParam("size") int size);
}

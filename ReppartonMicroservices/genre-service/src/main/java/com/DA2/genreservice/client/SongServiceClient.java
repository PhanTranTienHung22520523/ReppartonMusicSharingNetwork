package com.DA2.genreservice.client;

import com.DA2.shared.dto.ApiResponse;
import com.DA2.genreservice.dto.GenreCountDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@FeignClient(name = "song-service")
public interface SongServiceClient {

    @GetMapping("/api/songs/genres/counts")
    ApiResponse<List<GenreCountDTO>> getGenreCounts();
}

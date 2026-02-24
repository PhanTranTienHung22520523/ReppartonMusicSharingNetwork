package com.DA2.songservice.dto;

import java.util.List;

public class GenreCountsResponse {
    private List<GenreCountDTO> genres;

    public GenreCountsResponse() {}

    public GenreCountsResponse(List<GenreCountDTO> genres) {
        this.genres = genres;
    }

    public List<GenreCountDTO> getGenres() {
        return genres;
    }

    public void setGenres(List<GenreCountDTO> genres) {
        this.genres = genres;
    }
}

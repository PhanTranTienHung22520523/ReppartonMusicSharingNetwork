package com.DA2.genreservice.dto;

public class GenreCountDTO {
    private String genre;
    private long count;

    public GenreCountDTO() {}

    public GenreCountDTO(String genre, long count) {
        this.genre = genre;
        this.count = count;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public long getCount() {
        return count;
    }

    public void setCount(long count) {
        this.count = count;
    }
}

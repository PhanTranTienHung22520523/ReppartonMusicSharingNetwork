package com.DA2.genreservice.dto;

public class GenreResponse {
    private String id;
    private String name;
    private String description;
    private long songCount;
    private boolean trending;

    public GenreResponse() {}

    public GenreResponse(String id, String name, String description, long songCount, boolean trending) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.songCount = songCount;
        this.trending = trending;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public long getSongCount() {
        return songCount;
    }

    public void setSongCount(long songCount) {
        this.songCount = songCount;
    }

    public boolean isTrending() {
        return trending;
    }

    public void setTrending(boolean trending) {
        this.trending = trending;
    }
}

package com.DA2.Repparton.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "genres")
public class Genre {
    @Id
    private String id;
    private String name;
    private String description;

    // Default constructor
    public Genre() {
    }

    // Constructor with parameters
    public Genre(String name, String description) {
        this.name = name;
        this.description = description;
    }

    // Getters and Setters
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

    // Builder pattern
    public static GenreBuilder builder() {
        return new GenreBuilder();
    }

    public static class GenreBuilder {
        private String name;
        private String description;

        public GenreBuilder name(String name) {
            this.name = name;
            return this;
        }

        public GenreBuilder description(String description) {
            this.description = description;
            return this;
        }

        public Genre build() {
            Genre genre = new Genre();
            genre.name = this.name;
            genre.description = this.description;
            return genre;
        }
    }
}

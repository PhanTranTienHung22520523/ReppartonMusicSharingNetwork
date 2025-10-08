package com.DA2.genreservice.service;

import com.DA2.genreservice.entity.Genre;
import com.DA2.genreservice.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class GenreService {

    @Autowired
    private GenreRepository repository;

    public Genre createGenre(Genre genre) {
        if (repository.existsByName(genre.getName())) {
            throw new RuntimeException("Genre already exists");
        }
        return repository.save(genre);
    }

    public List<Genre> getAllGenres() {
        return repository.findAll();
    }

    public Optional<Genre> getGenreById(String id) {
        return repository.findById(id);
    }

    public Optional<Genre> getGenreByName(String name) {
        return repository.findByName(name);
    }

    public Genre updateGenre(String id, Genre genreDetails) {
        Genre genre = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Genre not found"));
        
        genre.setName(genreDetails.getName());
        genre.setDescription(genreDetails.getDescription());
        
        return repository.save(genre);
    }

    public void deleteGenre(String id) {
        repository.deleteById(id);
    }
}
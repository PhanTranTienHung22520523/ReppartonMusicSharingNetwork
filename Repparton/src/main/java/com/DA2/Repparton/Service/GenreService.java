package com.DA2.Repparton.Service;

import com.DA2.Repparton.Entity.Genre;
import com.DA2.Repparton.Repository.GenreRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class GenreService {

    @Autowired
    private GenreRepo genreRepository;

    public Genre createGenre(Genre genre) {
        return genreRepository.save(genre);
    }

    public Optional<Genre> getGenreById(String id) {
        return genreRepository.findById(id);
    }

    public List<Genre> getAllGenres() {
        return genreRepository.findAll();
    }


//    public List<Genre> getGenresByType(String type) {
//        return genreRepository.f(type);
//    }

    public void deleteGenre(String id) {
        genreRepository.deleteById(id);
    }
}

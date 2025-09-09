package com.DA2.Repparton.Controller;

import com.DA2.Repparton.Entity.Genre;
import com.DA2.Repparton.Service.GenreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/genres")
public class GenreController {

    @Autowired
    private GenreService genreService;

    @PostMapping
    public ResponseEntity<?> createGenre(@RequestBody Genre genre) {
        Genre saved = genreService.createGenre(genre);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getGenreById(@PathVariable String id) {
        Optional<Genre> genre = genreService.getGenreById(id);
        return genre.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<?> getAllGenres() {
        List<Genre> genres = genreService.getAllGenres();
        return ResponseEntity.ok(genres);
    }

//    @GetMapping("/type/{type}")
//    public ResponseEntity<?> getGenresByType(@PathVariable String type) {
//        List<Genre> genres = genreService.getGenresByType(type);
//        return ResponseEntity.ok(genres);
//    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGenre(@PathVariable String id) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok("Deleted genre with id: " + id);
    }
}

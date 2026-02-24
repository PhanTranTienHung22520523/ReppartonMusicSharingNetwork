package com.DA2.genreservice.service;

import com.DA2.genreservice.client.SongServiceClient;
import com.DA2.genreservice.dto.GenreCountDTO;
import com.DA2.genreservice.dto.GenreResponse;
import com.DA2.genreservice.entity.Genre;
import com.DA2.genreservice.repository.GenreRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.Optional;

@Service
public class GenreService {

    @Autowired
    private GenreRepository repository;

    @Autowired(required = false)
    private SongServiceClient songServiceClient;

    public Genre createGenre(Genre genre) {
        if (repository.existsByName(genre.getName())) {
            throw new RuntimeException("Genre already exists");
        }
        return repository.save(genre);
    }

    public List<Genre> getAllGenres() {
        return repository.findAll();
    }

    public List<GenreResponse> getAllGenresEnriched() {
        List<Genre> genres = repository.findAll();

        Map<String, Long> counts = new HashMap<>();
        if (songServiceClient != null) {
            try {
                var resp = songServiceClient.getGenreCounts();
                List<GenreCountDTO> data = resp != null ? resp.getData() : null;
                if (data != null) {
                    for (GenreCountDTO dto : data) {
                        if (dto == null || dto.getGenre() == null) continue;
                        counts.put(dto.getGenre().trim().toLowerCase(), dto.getCount());
                    }
                }
            } catch (Exception ignored) {
                // Graceful fallback: counts remain empty
            }
        }

        List<GenreResponse> responses = new ArrayList<>();
        for (Genre genre : genres) {
            String name = genre.getName();
            String key = name == null ? "" : name.trim().toLowerCase();
            long songCount = key.isEmpty() ? 0 : counts.getOrDefault(key, 0L);
            responses.add(new GenreResponse(
                    genre.getId(),
                    genre.getName(),
                    genre.getDescription(),
                    songCount,
                    false
            ));
        }

        // Compute trending: top 4 by songCount
        responses.stream()
                .sorted(Comparator.comparingLong(GenreResponse::getSongCount).reversed())
                .limit(4)
                .forEach(r -> {
                    if (r != null && r.getSongCount() > 0) r.setTrending(true);
                });

        return responses;
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
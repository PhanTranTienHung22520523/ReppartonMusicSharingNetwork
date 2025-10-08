package com.DA2.genreservice.repository;

import com.DA2.genreservice.entity.Genre;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface GenreRepository extends MongoRepository<Genre, String> {
    Optional<Genre> findByName(String name);
    boolean existsByName(String name);
}
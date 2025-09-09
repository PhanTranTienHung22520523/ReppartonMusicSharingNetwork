package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Genre;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GenreRepo extends MongoRepository<Genre, String> {
    Optional<Genre> findByName(String name);
    List<Genre> findByNameContainingIgnoreCase(String name);
    boolean existsByName(String name);
}

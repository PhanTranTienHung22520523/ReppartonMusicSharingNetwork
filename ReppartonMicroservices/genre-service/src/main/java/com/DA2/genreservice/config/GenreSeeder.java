package com.DA2.genreservice.config;

import com.DA2.genreservice.entity.Genre;
import com.DA2.genreservice.repository.GenreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class GenreSeeder {

    @Bean
    CommandLineRunner seedGenres(GenreRepository genreRepository) {
        return args -> {
            List<Genre> defaults = List.of(
                    new Genre("Pop", "Popular music"),
                    new Genre("Rock", "Rock and roll"),
                    new Genre("Hip Hop", "Hip hop and rap"),
                    new Genre("R&B", "Rhythm and blues"),
                    new Genre("Jazz", "Jazz and blues"),
                    new Genre("Electronic", "EDM and electronic"),
                    new Genre("Classical", "Classical music"),
                    new Genre("K-Pop", "Korean pop"),
                    new Genre("J-Pop", "Japanese pop"),
                    new Genre("Indie", "Independent / indie"),
                    new Genre("Dance", "Dance music"),
                    new Genre("House", "House music"),
                    new Genre("Techno", "Techno"),
                    new Genre("Trance", "Trance"),
                    new Genre("Dubstep", "Dubstep"),
                    new Genre("Lo-fi", "Lo-fi / chill"),
                    new Genre("Acoustic", "Acoustic"),
                    new Genre("Ballad", "Ballad"),
                    new Genre("Soul", "Soul"),
                    new Genre("Blues", "Blues"),
                    new Genre("Funk", "Funk"),
                    new Genre("Reggae", "Reggae"),
                    new Genre("Country", "Country"),
                    new Genre("Folk", "Folk"),
                    new Genre("Metal", "Metal"),
                    new Genre("Punk", "Punk"),
                    new Genre("Alternative", "Alternative"),
                    new Genre("Soundtrack", "Film / game soundtrack"),
                    new Genre("Instrumental", "Instrumental"),
                    new Genre("Chill", "Chill"),
                    new Genre("Workout", "Workout / gym"),
                    new Genre("Ambient", "Ambient"),
                    new Genre("Latin", "Latin"),
                    new Genre("Afrobeat", "Afrobeat"),
                    new Genre("Gospel", "Gospel"),
                    new Genre("Children", "Kids"),
                    new Genre("V-Pop", "Vietnamese pop")
            );

            for (Genre g : defaults) {
                if (g == null || g.getName() == null) continue;
                if (genreRepository.existsByName(g.getName())) continue;
                genreRepository.save(g);
            }
        };
    }
}

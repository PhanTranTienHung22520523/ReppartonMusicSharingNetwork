package com.DA2.songservice.config;

import com.DA2.songservice.entity.Song;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.index.Index;
import org.springframework.data.mongodb.core.index.TextIndexDefinition;

import jakarta.annotation.PostConstruct;
import org.springframework.data.domain.Sort.Direction;
import static org.springframework.data.domain.Sort.Direction.ASC;
import static org.springframework.data.domain.Sort.Direction.DESC;

/**
 * MongoDB Indexing Configuration
 * Creates indexes for optimal query performance
 */
@Configuration
@Slf4j
public class MongoIndexConfig {

    private final MongoTemplate mongoTemplate;

    public MongoIndexConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @PostConstruct
    public void createIndexes() {
        log.info("Creating MongoDB indexes for Song collection...");

        // Text index for search functionality (title, artist, lyrics)
        TextIndexDefinition textIndex = new TextIndexDefinition.TextIndexDefinitionBuilder()
                .onField("title", 10.0f)      // Higher weight for title
                .onField("artist", 8.0f)     // High weight for artist
                .onField("lyrics", 3.0f)     // Lower weight for lyrics
                .onField("genres", 2.0f)     // Lower weight for genres
                .build();

        mongoTemplate.indexOps(Song.class).ensureIndex(textIndex);
        log.info("Created text index for search fields");

        // Compound index for public songs sorted by creation date (most common query)
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("isPublic", ASC)
                        .on("isActive", ASC)
                        .on("createdAt", DESC)
        );
        log.info("Created compound index for public songs by date");

        // Index for user-specific queries
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("uploadedBy", ASC)
                        .on("createdAt", DESC)
        );
        log.info("Created index for user songs by date");

        // Index for AI analysis queries
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("aiAnalysis.key", ASC)
                        .on("aiAnalysis.mood", ASC)
        );
        log.info("Created index for AI analysis queries");

        // Index for tempo range queries
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index().on("aiAnalysis.tempo", ASC)
        );
        log.info("Created index for tempo queries");

        // Index for energy/danceability queries
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("aiAnalysis.energy", ASC)
                        .on("aiAnalysis.danceability", ASC)
        );
        log.info("Created index for audio features queries");

        // Index for play count (for popular songs)
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index().on("playsCount", DESC)
        );
        log.info("Created index for popular songs by play count");

        // Index for recent activity
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index().on("updatedAt", DESC)
        );
        log.info("Created index for recent updates");

        // Compound index for lyrics search (when lyrics exist)
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("lyrics", ASC)
                        .on("title", ASC)
        );
        log.info("Created compound index for lyrics queries");

        // Index for chord analysis queries
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("aiAnalysis.chordAnalysis.uniqueChords", ASC)
                        .on("aiAnalysis.chordAnalysis.chordCount", DESC)
        );
        log.info("Created index for chord analysis queries");

        // Index for chord progression complexity
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("aiAnalysis.chordAnalysis.progressionAnalysis.complexityScore", DESC)
                        .on("aiAnalysis.chordAnalysis.averageConfidence", DESC)
        );
        log.info("Created index for chord progression complexity");

        // Index for key compatibility analysis
        mongoTemplate.indexOps(Song.class).ensureIndex(
                new Index()
                        .on("aiAnalysis.chordAnalysis.keyCompatibility.bestMatchingKey", ASC)
                        .on("aiAnalysis.chordAnalysis.keyCompatibility.compatibilityScore", DESC)
        );
        log.info("Created index for key compatibility analysis");

        log.info("All MongoDB indexes created successfully!");
    }
}
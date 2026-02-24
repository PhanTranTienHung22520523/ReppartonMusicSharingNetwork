package com.DA2.analyticsservice.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "admin_artist_plays_daily",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_admin_artist_plays_daily", columnNames = {"day", "artist_id"})
    }
)
public class AdminArtistPlaysDaily {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "day", nullable = false)
    private LocalDate day;

    @Column(name = "artist_id", nullable = false)
    private String artistId;

    @Column(name = "plays", nullable = false)
    private long plays;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AdminArtistPlaysDaily() {}

    public AdminArtistPlaysDaily(LocalDate day, String artistId, long plays) {
        this.day = day;
        this.artistId = artistId;
        this.plays = plays;
    }

    @PrePersist
    public void prePersist() {
        if (id == null || id.isBlank()) id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        if (createdAt == null) createdAt = now;
        if (updatedAt == null) updatedAt = now;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public LocalDate getDay() {
        return day;
    }

    public void setDay(LocalDate day) {
        this.day = day;
    }

    public String getArtistId() {
        return artistId;
    }

    public void setArtistId(String artistId) {
        this.artistId = artistId;
    }

    public long getPlays() {
        return plays;
    }

    public void setPlays(long plays) {
        this.plays = plays;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}

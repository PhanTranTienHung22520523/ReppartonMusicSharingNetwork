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
    name = "admin_search_query_daily",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_admin_search_query_daily", columnNames = {"day", "search_query"})
    }
)
public class AdminSearchQueryDaily {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "day", nullable = false)
    private LocalDate day;

    @Column(name = "search_query", nullable = false)
    private String searchQuery;

    @Column(name = "searches", nullable = false)
    private long searches;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AdminSearchQueryDaily() {}

    public AdminSearchQueryDaily(LocalDate day, String searchQuery, long searches) {
        this.day = day;
        this.searchQuery = searchQuery;
        this.searches = searches;
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

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public long getSearches() {
        return searches;
    }

    public void setSearches(long searches) {
        this.searches = searches;
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

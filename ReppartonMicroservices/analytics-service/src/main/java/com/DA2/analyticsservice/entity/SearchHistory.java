package com.DA2.analyticsservice.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "search_history")
public class SearchHistory {
    @Id
    private String id;
    private String userId;
    private String searchQuery;
    private LocalDateTime searchedAt;

    public SearchHistory() {
        this.searchedAt = LocalDateTime.now();
    }

    public SearchHistory(String userId, String searchQuery) {
        this.userId = userId;
        this.searchQuery = searchQuery;
        this.searchedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getSearchQuery() {
        return searchQuery;
    }

    public void setSearchQuery(String searchQuery) {
        this.searchQuery = searchQuery;
    }

    public LocalDateTime getSearchedAt() {
        return searchedAt;
    }

    public void setSearchedAt(LocalDateTime searchedAt) {
        this.searchedAt = searchedAt;
    }
}
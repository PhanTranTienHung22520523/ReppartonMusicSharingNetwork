package com.DA2.Repparton.Entity;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "search_history")
public class SearchHistory {
    @Id
    private String id;
    private String userId;
    private String searchQuery;
    private LocalDateTime searchedAt;

    public SearchHistory() {}

    public SearchHistory(String id, String userId, String searchQuery, LocalDateTime searchedAt) {
        this.id = id;
        this.userId = userId;
        this.searchQuery = searchQuery;
        this.searchedAt = searchedAt;
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

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    // Getter + Setter
}

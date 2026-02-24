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
    name = "admin_user_listens_daily",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_admin_user_listens_daily", columnNames = {"day", "user_id"})
    }
)
public class AdminUserListensDaily {

    @Id
    @Column(name = "id", nullable = false, updatable = false)
    private String id;

    @Column(name = "day", nullable = false)
    private LocalDate day;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(name = "listens", nullable = false)
    private long listens;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public AdminUserListensDaily() {}

    public AdminUserListensDaily(LocalDate day, String userId, long listens) {
        this.day = day;
        this.userId = userId;
        this.listens = listens;
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

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public long getListens() {
        return listens;
    }

    public void setListens(long listens) {
        this.listens = listens;
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

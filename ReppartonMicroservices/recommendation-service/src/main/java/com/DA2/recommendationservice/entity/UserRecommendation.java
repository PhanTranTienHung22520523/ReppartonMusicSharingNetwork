package com.DA2.recommendationservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_recommendations")
public class UserRecommendation {
    @Id
    private String userId;
    private List<String> recommendedSongIds;
    private LocalDateTime updatedAt;
}

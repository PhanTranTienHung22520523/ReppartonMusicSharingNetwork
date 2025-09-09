package com.DA2.songservice.entity;

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
@Document(collection = "songs")
public class Song {
    @Id
    private String id;
    private String title;
    private String artist;
    private String fileUrl;
    private String coverImageUrl;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long duration; // in seconds
    
    @Builder.Default
    private Integer likesCount = 0;
    @Builder.Default
    private Integer playsCount = 0;
    @Builder.Default
    private Integer commentsCount = 0;
    @Builder.Default
    private Integer sharesCount = 0;
    
    private List<String> genres;
    private String description;
    private boolean isPublic = true;
    private boolean isActive = true;
}

package com.DA2.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SongDto {
    private String id;
    private String title;
    private String artist;
    private String fileUrl;
    private String coverImage;
    private String uploadedBy;
    private LocalDateTime createdAt;
    private Long duration;
    private Integer likesCount;
    private Integer playsCount;
}

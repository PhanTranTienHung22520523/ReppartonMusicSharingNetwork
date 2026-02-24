package com.DA2.messageservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "group_posts")
public class GroupPost {
    
    @Id
    private String id;
    
    private String groupId;
    private String artistId;       // Only artist can post to group timeline
    private String artistName;
    
    private String content;
    private String mediaUrl;       // Image/video URL
    private String mediaType;      // "image", "video", "text"
    
    private LocalDateTime createdAt;
    private int likeCount = 0;
    private int commentCount = 0;
    
    public GroupPost(String groupId, String artistId, String artistName, String content, String mediaUrl, String mediaType) {
        this.groupId = groupId;
        this.artistId = artistId;
        this.artistName = artistName;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.mediaType = mediaType;
        this.createdAt = LocalDateTime.now();
    }
}

package com.DA2.messageservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "artist_groups")
public class ArtistGroup {
    
    @Id
    private String id;
    
    private String artistId;           // Owner of the group (must be verified artist)
    private String artistName;         // Display name of artist
    private String groupName;          // Name of the group
    private String description;        // Group description
    private String groupImageUrl;      // Group profile image
    
    private List<String> memberIds = new ArrayList<>();     // All members who joined the group
    private List<String> chatAllowedIds = new ArrayList<>(); // Members who can chat (invited by artist)
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    private boolean isActive = true;
    private int memberCount = 0;
    private int postCount = 0;
    
    // Constructor for creating new group
    public ArtistGroup(String artistId, String artistName, String groupName, String description) {
        this.artistId = artistId;
        this.artistName = artistName;
        this.groupName = groupName;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.memberIds = new ArrayList<>();
        this.chatAllowedIds = new ArrayList<>();
        // Artist is automatically a member and can chat
        this.memberIds.add(artistId);
        this.chatAllowedIds.add(artistId);
        this.memberCount = 1;
    }
    
    // Helper methods
    public void addMember(String userId) {
        if (!memberIds.contains(userId)) {
            memberIds.add(userId);
            memberCount = memberIds.size();
            updatedAt = LocalDateTime.now();
        }
    }
    
    public void removeMember(String userId) {
        memberIds.remove(userId);
        chatAllowedIds.remove(userId);
        memberCount = memberIds.size();
        updatedAt = LocalDateTime.now();
    }
    
    public void allowChat(String userId) {
        if (memberIds.contains(userId) && !chatAllowedIds.contains(userId)) {
            chatAllowedIds.add(userId);
            updatedAt = LocalDateTime.now();
        }
    }
    
    public void disallowChat(String userId) {
        chatAllowedIds.remove(userId);
        updatedAt = LocalDateTime.now();
    }
    
    public boolean isMember(String userId) {
        return memberIds.contains(userId);
    }
    
    public boolean canChat(String userId) {
        return chatAllowedIds.contains(userId);
    }
    
    public boolean isOwner(String userId) {
        return artistId.equals(userId);
    }
}

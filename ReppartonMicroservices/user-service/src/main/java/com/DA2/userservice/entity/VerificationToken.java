package com.DA2.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "verification_tokens")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {
    
    @Id
    private String id;
    
    @Indexed
    private String token;
    
    @Indexed
    private String userId;
    
    private String email;
    
    @Indexed
    private String code; // optional numeric verification code (e.g., 6 digits)
    
    private TokenType type; // EMAIL_VERIFICATION, PASSWORD_RESET
    
    @Indexed(expireAfterSeconds = 86400) // Auto-delete after 24 hours
    private LocalDateTime createdAt;
    
    private LocalDateTime expiresAt;
    
    private boolean used;
    
    public enum TokenType {
        EMAIL_VERIFICATION,
        PASSWORD_RESET
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}

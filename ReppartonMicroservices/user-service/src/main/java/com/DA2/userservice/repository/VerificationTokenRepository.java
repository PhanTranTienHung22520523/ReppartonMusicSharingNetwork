package com.DA2.userservice.repository;

import com.DA2.userservice.entity.VerificationToken;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VerificationTokenRepository extends MongoRepository<VerificationToken, String> {
    
    Optional<VerificationToken> findByToken(String token);
    
    Optional<VerificationToken> findByUserIdAndType(String userId, VerificationToken.TokenType type);

    Optional<VerificationToken> findByEmailAndCodeAndType(String email, String code, VerificationToken.TokenType type);
    
    void deleteByUserId(String userId);
}

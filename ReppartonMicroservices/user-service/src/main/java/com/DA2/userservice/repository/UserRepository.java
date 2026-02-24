package com.DA2.userservice.repository;

import com.DA2.userservice.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    @Query("{ '$or': [ { 'username': { $regex: ?0, $options: 'i' } }, { 'email': { $regex: ?0, $options: 'i' } }, { 'firstName': { $regex: ?0, $options: 'i' } }, { 'lastName': { $regex: ?0, $options: 'i' } }, { 'fullName': { $regex: ?0, $options: 'i' } } ] }")
    Page<User> searchUsers(String keyword, Pageable pageable);
    
    // Admin methods
    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email, Pageable pageable);

    // NOTE: artistVerification is a nested object, so we must query on artistVerification.status
    @Query("{ 'artistVerification.status': ?0 }")
    Page<User> findByArtistVerificationStatus(String status, Pageable pageable);

    long countByIsVerifiedTrue();
    long countByIsBannedTrue();
    long countByRolesContaining(String role);

    @Query(value = "{ 'artistVerification.status': ?0 }", count = true)
    long countByArtistVerificationStatus(String status);

    @Query(value = "{ '$or': [ { 'isVerified': true }, { 'isEmailVerified': true } ] }", count = true)
    long countByAnyVerifiedTrue();

    @Query(value = "{ '$or': [ { 'role': ?0 }, { 'roles': ?0 } ] }", count = true)
    long countByRoleOrRoles(String role);
}

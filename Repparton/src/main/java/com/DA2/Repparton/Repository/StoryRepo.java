package com.DA2.Repparton.Repository;

import com.DA2.Repparton.Entity.Story;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StoryRepo extends MongoRepository<Story, String> {
    List<Story> findByUserId(String userId);
    List<Story> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Story> findByExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);
    List<Story> findByUserIdAndExpiresAtAfterOrderByCreatedAtDesc(String userId, LocalDateTime now);
    void deleteByExpiresAtBefore(LocalDateTime now); // Xóa stories đã hết hạn

    List<Story> findByIsPrivateFalseAndExpiresAtAfterOrderByCreatedAtDesc(LocalDateTime now);

    List<Story> findByExpiresAtBefore(LocalDateTime now);

    List<Story> findByUserIdInAndIsPrivateFalseAndExpiresAtAfterOrderByCreatedAtDesc(List<String> followingUserIds, LocalDateTime now);
}

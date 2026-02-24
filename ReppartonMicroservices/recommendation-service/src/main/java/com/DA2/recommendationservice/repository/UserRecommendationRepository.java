package com.DA2.recommendationservice.repository;

import com.DA2.recommendationservice.entity.UserRecommendation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRecommendationRepository extends MongoRepository<UserRecommendation, String> {
}

package com.DA2.userservice.repository;

import com.DA2.userservice.entity.DeviceInfo;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeviceInfoRepository extends MongoRepository<DeviceInfo, String> {
    List<DeviceInfo> findByUserId(String userId);
    Optional<DeviceInfo> findByUserIdAndDeviceId(String userId, String deviceId);
    List<DeviceInfo> findByUserIdAndIsTrusted(String userId, boolean isTrusted);
    Optional<DeviceInfo> findBySessionId(String sessionId);
    void deleteByUserIdAndDeviceId(String userId, String deviceId);
}
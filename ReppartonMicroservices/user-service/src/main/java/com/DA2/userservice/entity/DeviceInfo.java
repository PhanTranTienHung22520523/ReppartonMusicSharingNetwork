package com.DA2.userservice.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "device_info")
public class DeviceInfo {
    @Id
    private String id;
    private String userId;
    private String deviceId; // Unique device identifier
    private String deviceName; // e.g., "Chrome on Windows"
    private String userAgent; // Browser/device user agent
    private String ipAddress;
    private String location; // City, Country from IP geolocation
    private Double latitude;
    private Double longitude;
    private String sessionId;
    @Builder.Default
    private boolean isTrusted = false;
    @Builder.Default
    private boolean isCurrentDevice = false;
    private LocalDateTime firstLoginAt;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DeviceInfo(String userId, String deviceId, String deviceName, String userAgent,
                     String ipAddress, String sessionId) {
        this.userId = userId;
        this.deviceId = deviceId;
        this.deviceName = deviceName;
        this.userAgent = userAgent;
        this.ipAddress = ipAddress;
        this.sessionId = sessionId;
        this.firstLoginAt = LocalDateTime.now();
        this.lastLoginAt = LocalDateTime.now();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
}
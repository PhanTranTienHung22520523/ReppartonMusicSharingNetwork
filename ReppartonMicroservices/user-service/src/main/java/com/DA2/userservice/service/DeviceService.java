package com.DA2.userservice.service;

import com.DA2.userservice.entity.DeviceInfo;
import com.DA2.userservice.repository.DeviceInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceService {

    private final DeviceInfoRepository deviceInfoRepository;
    private final NotificationService notificationService;

    /**
     * Record device login and detect suspicious activity
     */
    public DeviceInfo recordDeviceLogin(String userId, String deviceId, String deviceName,
                                       String userAgent, String ipAddress, String sessionId) {
        Optional<DeviceInfo> existingDevice = deviceInfoRepository.findByUserIdAndDeviceId(userId, deviceId);

        if (existingDevice.isPresent()) {
            // Update existing device info
            DeviceInfo device = existingDevice.get();
            device.setLastLoginAt(LocalDateTime.now());
            device.setSessionId(sessionId);
            device.setUpdatedAt(LocalDateTime.now());

            // Update IP if changed
            if (!ipAddress.equals(device.getIpAddress())) {
                device.setIpAddress(ipAddress);
                // TODO: Update location based on new IP
            }

            return deviceInfoRepository.save(device);
        } else {
            // New device - check for suspicious activity
            DeviceInfo newDevice = DeviceInfo.builder()
                    .userId(userId)
                    .deviceId(deviceId)
                    .deviceName(deviceName)
                    .userAgent(userAgent)
                    .ipAddress(ipAddress)
                    .sessionId(sessionId)
                    .firstLoginAt(LocalDateTime.now())
                    .lastLoginAt(LocalDateTime.now())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            DeviceInfo savedDevice = deviceInfoRepository.save(newDevice);

            // Check for suspicious login
            checkForSuspiciousLogin(userId, savedDevice);

            return savedDevice;
        }
    }

    /**
     * Mark device as trusted
     */
    public void markDeviceAsTrusted(String userId, String deviceId) {
        Optional<DeviceInfo> device = deviceInfoRepository.findByUserIdAndDeviceId(userId, deviceId);
        if (device.isPresent()) {
            DeviceInfo deviceInfo = device.get();
            deviceInfo.setTrusted(true);
            deviceInfo.setUpdatedAt(LocalDateTime.now());
            deviceInfoRepository.save(deviceInfo);
            log.info("Device {} marked as trusted for user {}", deviceId, userId);
        }
    }

    /**
     * Remove device (logout from all sessions)
     */
    public void removeDevice(String userId, String deviceId) {
        deviceInfoRepository.deleteByUserIdAndDeviceId(userId, deviceId);
        log.info("Device {} removed for user {}", deviceId, userId);
    }

    /**
     * Get all devices for a user
     */
    public List<DeviceInfo> getUserDevices(String userId) {
        return deviceInfoRepository.findByUserId(userId);
    }

    /**
     * Check for suspicious login patterns
     */
    private void checkForSuspiciousLogin(String userId, DeviceInfo newDevice) {
        List<DeviceInfo> userDevices = deviceInfoRepository.findByUserId(userId);

        // Check if login from different country/location
        boolean hasLocationMismatch = checkLocationMismatch(userDevices, newDevice);

        // Check if login from unusual time
        boolean hasTimeAnomaly = checkTimeAnomaly(newDevice);

        // Check if multiple failed attempts recently
        boolean hasRecentFailures = checkRecentFailures(userId);

        if (hasLocationMismatch || hasTimeAnomaly || hasRecentFailures) {
            // Send security alert notification
            sendSecurityAlert(userId, newDevice, hasLocationMismatch, hasTimeAnomaly, hasRecentFailures);
            log.warn("Suspicious login detected for user {} from device {}", userId, newDevice.getDeviceId());
        }
    }

    private boolean checkLocationMismatch(List<DeviceInfo> existingDevices, DeviceInfo newDevice) {
        // Simple check: if no trusted devices exist, consider it normal
        long trustedDevicesCount = existingDevices.stream()
                .filter(DeviceInfo::isTrusted)
                .count();

        if (trustedDevicesCount == 0) {
            return false; // First device, not suspicious
        }

        // TODO: Implement IP geolocation comparison
        // For now, just check if IP is different from trusted devices
        return existingDevices.stream()
                .filter(DeviceInfo::isTrusted)
                .noneMatch(device -> device.getIpAddress().equals(newDevice.getIpAddress()));
    }

    private boolean checkTimeAnomaly(DeviceInfo newDevice) {
        // Check if login is at unusual hours (e.g., 2-5 AM)
        int hour = newDevice.getLastLoginAt().getHour();
        return hour >= 2 && hour <= 5;
    }

    private boolean checkRecentFailures(String userId) {
        // TODO: Implement failed login attempt tracking
        // For now, return false
        return false;
    }

    private void sendSecurityAlert(String userId, DeviceInfo device, boolean locationMismatch,
                                 boolean timeAnomaly, boolean recentFailures) {
        StringBuilder alertMessage = new StringBuilder();
        alertMessage.append("🚨 Security Alert: New device login detected\n\n");
        alertMessage.append("Device: ").append(device.getDeviceName()).append("\n");
        alertMessage.append("Location: ").append(device.getLocation() != null ? device.getLocation() : "Unknown").append("\n");
        alertMessage.append("Time: ").append(device.getLastLoginAt()).append("\n\n");

        if (locationMismatch) {
            alertMessage.append("⚠️ Unusual location detected\n");
        }
        if (timeAnomaly) {
            alertMessage.append("⚠️ Login at unusual time\n");
        }
        if (recentFailures) {
            alertMessage.append("⚠️ Recent failed login attempts\n");
        }

        alertMessage.append("\nIf this wasn't you, please change your password immediately.");

        // Send notification via notification service
        try {
            notificationService.sendSecurityAlert(userId, "New Device Login Alert", alertMessage.toString());
        } catch (Exception e) {
            log.error("Failed to send security alert notification for user {}", userId, e);
        }
    }

    /**
     * Update device location based on IP
     */
    public void updateDeviceLocation(String deviceId, String location, Double latitude, Double longitude) {
        Optional<DeviceInfo> deviceOpt = deviceInfoRepository.findById(deviceId);
        if (deviceOpt.isPresent()) {
            DeviceInfo device = deviceOpt.get();
            device.setLocation(location);
            device.setLatitude(latitude);
            device.setLongitude(longitude);
            device.setUpdatedAt(LocalDateTime.now());
            deviceInfoRepository.save(device);
        }
    }
}
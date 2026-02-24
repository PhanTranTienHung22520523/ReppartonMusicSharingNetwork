package com.DA2.userservice.controller;

import com.DA2.userservice.dto.DeviceRecordRequest;
import com.DA2.userservice.entity.DeviceInfo;
import com.DA2.userservice.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @PostMapping("/record")
    public ResponseEntity<DeviceInfo> recordCurrentDevice(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody(required = false) DeviceRecordRequest request,
            HttpServletRequest httpRequest,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader) {

        DeviceRecordRequest req = request != null ? request : new DeviceRecordRequest();

        if (req.getUserAgent() == null || req.getUserAgent().isBlank()) {
            String ua = httpRequest.getHeader("User-Agent");
            if (ua != null && !ua.isBlank()) {
                req.setUserAgent(ua);
            }
        }

        if (req.getIpAddress() == null || req.getIpAddress().isBlank()) {
            req.setIpAddress(extractClientIp(httpRequest));
        }

        String sessionId = null;
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            sessionId = authorizationHeader.substring("Bearer ".length()).trim();
        }

        DeviceInfo device = deviceService.recordDeviceLogin(
                userId,
                req.getDeviceId(),
                req.getDeviceName(),
                req.getUserAgent(),
                req.getIpAddress(),
                sessionId
        );
        return ResponseEntity.ok(device);
    }

    /**
     * Get all devices for current user
     */
    @GetMapping
    public ResponseEntity<List<DeviceInfo>> getUserDevices(@RequestHeader("X-User-Id") String userId) {
        List<DeviceInfo> devices = deviceService.getUserDevices(userId);
        return ResponseEntity.ok(devices);
    }

    /**
     * Mark device as trusted
     */
    @PostMapping("/{deviceId}/trust")
    public ResponseEntity<Void> markDeviceAsTrusted(
            @PathVariable("deviceId") String deviceId,
            @RequestHeader("X-User-Id") String userId) {
        deviceService.markDeviceAsTrusted(userId, deviceId);
        return ResponseEntity.ok().build();
    }

    /**
     * Remove device (logout from device)
     */
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> removeDevice(
            @PathVariable("deviceId") String deviceId,
            @RequestHeader("X-User-Id") String userId) {
        deviceService.removeDevice(userId, deviceId);
        return ResponseEntity.ok().build();
    }

    /**
     * Update device location (called by frontend with GPS data)
     */
    @PostMapping("/{deviceId}/location")
    public ResponseEntity<Void> updateDeviceLocation(
            @PathVariable("deviceId") String deviceId,
            @RequestParam(value = "location") String location,
            @RequestParam(value = "latitude", required = false) Double latitude,
            @RequestParam(value = "longitude", required = false) Double longitude,
            @RequestHeader("X-User-Id") String userId) {
        // Verify device belongs to user
        List<DeviceInfo> userDevices = deviceService.getUserDevices(userId);
        boolean deviceBelongsToUser = userDevices.stream()
                .anyMatch(device -> device.getId().equals(deviceId));

        if (!deviceBelongsToUser) {
            return ResponseEntity.notFound().build();
        }

        deviceService.updateDeviceLocation(deviceId, location, latitude, longitude);
        return ResponseEntity.ok().build();
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isBlank()) {
            return xRealIp.trim();
        }

        return request.getRemoteAddr();
    }
}
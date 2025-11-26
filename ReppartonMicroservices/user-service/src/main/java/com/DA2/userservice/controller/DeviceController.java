package com.DA2.userservice.controller;

import com.DA2.userservice.entity.DeviceInfo;
import com.DA2.userservice.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

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
            @PathVariable String deviceId,
            @RequestHeader("X-User-Id") String userId) {
        deviceService.markDeviceAsTrusted(userId, deviceId);
        return ResponseEntity.ok().build();
    }

    /**
     * Remove device (logout from device)
     */
    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> removeDevice(
            @PathVariable String deviceId,
            @RequestHeader("X-User-Id") String userId) {
        deviceService.removeDevice(userId, deviceId);
        return ResponseEntity.ok().build();
    }

    /**
     * Update device location (called by frontend with GPS data)
     */
    @PostMapping("/{deviceId}/location")
    public ResponseEntity<Void> updateDeviceLocation(
            @PathVariable String deviceId,
            @RequestParam String location,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude,
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
}
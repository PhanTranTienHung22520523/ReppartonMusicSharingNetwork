package com.DA2.userservice.dto;

import lombok.Data;

@Data
public class DeviceRecordRequest {
    private String deviceId;
    private String deviceName;
    private String userAgent;
    private String ipAddress;
    private String deviceType;
}

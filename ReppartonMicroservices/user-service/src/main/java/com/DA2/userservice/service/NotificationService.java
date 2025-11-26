package com.DA2.userservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://localhost:8086/api/notifications}")
    private String notificationServiceUrl;

    /**
     * Send security alert notification
     */
    public void sendSecurityAlert(String userId, String title, String message) {
        try {
            Map<String, Object> notificationRequest = new HashMap<>();
            notificationRequest.put("userId", userId);
            notificationRequest.put("title", title);
            notificationRequest.put("message", message);
            notificationRequest.put("type", "SECURITY_ALERT");
            notificationRequest.put("priority", "HIGH");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notificationRequest, headers);

            String url = notificationServiceUrl + "/send";
            restTemplate.postForObject(url, request, String.class);

            log.info("Security alert sent to user {}", userId);
        } catch (Exception e) {
            log.error("Failed to send security alert to user {}", userId, e);
            // Don't throw exception to avoid breaking login flow
        }
    }

    /**
     * Send general notification
     */
    public void sendNotification(String userId, String title, String message, String type) {
        try {
            Map<String, Object> notificationRequest = new HashMap<>();
            notificationRequest.put("userId", userId);
            notificationRequest.put("title", title);
            notificationRequest.put("message", message);
            notificationRequest.put("type", type);
            notificationRequest.put("priority", "NORMAL");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(notificationRequest, headers);

            String url = notificationServiceUrl + "/send";
            restTemplate.postForObject(url, request, String.class);

            log.info("Notification sent to user {}: {}", userId, type);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}", userId, e);
        }
    }
}
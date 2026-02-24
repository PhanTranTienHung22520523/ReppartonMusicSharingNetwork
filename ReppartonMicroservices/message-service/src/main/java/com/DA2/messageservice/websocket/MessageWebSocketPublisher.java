package com.DA2.messageservice.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
public class MessageWebSocketPublisher {

    private final ObjectMapper objectMapper;

    // userId -> sessions
    private final ConcurrentHashMap<String, CopyOnWriteArraySet<WebSocketSession>> sessionsByUserId = new ConcurrentHashMap<>();

    public MessageWebSocketPublisher(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public void register(String userId, WebSocketSession session) {
        if (userId == null || userId.isBlank() || session == null) {
            return;
        }
        sessionsByUserId.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
    }

    public void unregister(String userId, WebSocketSession session) {
        if (userId == null || userId.isBlank() || session == null) {
            return;
        }
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null) {
            return;
        }
        sessions.remove(session);
        if (sessions.isEmpty()) {
            sessionsByUserId.remove(userId);
        }
    }

    public void sendToUser(String userId, Map<String, Object> payload) {
        if (userId == null || userId.isBlank() || payload == null) {
            return;
        }
        Set<WebSocketSession> sessions = sessionsByUserId.get(userId);
        if (sessions == null || sessions.isEmpty()) {
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(payload);
            TextMessage message = new TextMessage(json);
            for (WebSocketSession session : sessions) {
                if (session != null && session.isOpen()) {
                    session.sendMessage(message);
                }
            }
        } catch (Exception ignored) {
            // Best-effort push only; failures shouldn't break REST flow.
        }
    }
}

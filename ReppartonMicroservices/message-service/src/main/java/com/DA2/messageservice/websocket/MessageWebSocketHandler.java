package com.DA2.messageservice.websocket;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
public class MessageWebSocketHandler extends TextWebSocketHandler {

    private final MessageWebSocketPublisher publisher;

    public MessageWebSocketHandler(MessageWebSocketPublisher publisher) {
        this.publisher = publisher;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String userId = resolveUserId(session);
        publisher.register(userId, session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String userId = resolveUserId(session);
        publisher.unregister(userId, session);
    }

    private String resolveUserId(WebSocketSession session) {
        if (session == null) {
            return null;
        }
        if (session.getPrincipal() != null) {
            return session.getPrincipal().getName();
        }
        Object attr = session.getAttributes() != null ? session.getAttributes().get("userId") : null;
        return attr != null ? String.valueOf(attr) : null;
    }
}

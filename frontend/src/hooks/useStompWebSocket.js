import { useEffect, useRef, useState, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../contexts/AuthContext';

// Polyfill for SockJS in browser environment
if (typeof global === 'undefined') {
  window.global = window;
}

/**
 * Custom hook for STOMP WebSocket connections
 * @param {string} endpoint - WebSocket endpoint path
 * @param {Object} options - Configuration options
 */
export function useStompWebSocket(endpoint, options = {}) {
  const { onMessage, onConnect, onDisconnect, onError } = options;

  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const clientRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Avoid reconnect loops caused by unstable callback identities from callers.
  const callbacksRef = useRef({
    onMessage: undefined,
    onConnect: undefined,
    onDisconnect: undefined,
    onError: undefined,
  });

  useEffect(() => {
    callbacksRef.current = { onMessage, onConnect, onDisconnect, onError };
  }, [onMessage, onConnect, onDisconnect, onError]);

  const connect = useCallback(() => {
    if (!user || !endpoint) {
      console.log('STOMP: Cannot connect - missing user or endpoint');
      return;
    }

    if (clientRef.current && clientRef.current.connected) {
      console.log('STOMP: Already connected');
      return;
    }

    console.log(`STOMP: Connecting to ${endpoint}...`);

    // Create STOMP client with native WebSocket (no SockJS)
    const client = new Client({
      brokerURL: `ws://localhost:8090${endpoint}`,
      connectHeaders: {
        userId: user.id || user.userId || user._id
      },
      debug: (str) => {
        // Only log important messages
        if (str.includes('Opening') || str.includes('Closing') || str.includes('ERROR')) {
          console.log('STOMP:', str);
        }
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    client.onConnect = (frame) => {
      console.log('STOMP: Connected successfully', frame);
      setIsConnected(true);

      // Subscribe to user-specific queue
      const userId = user.id || user.userId || user._id;
      subscriptionRef.current = client.subscribe(
        `/user/${userId}/queue/notifications`,
        (message) => {
          console.log('STOMP: Message received', message.body);
          try {
            const notification = JSON.parse(message.body);
            setLastMessage(notification);
            const cb = callbacksRef.current.onMessage;
            if (cb) cb(notification);
          } catch (error) {
            console.error('STOMP: Error parsing message', error);
          }
        }
      );

      const cb = callbacksRef.current.onConnect;
      if (cb) cb(frame);
    };

    client.onStompError = (frame) => {
      console.error('STOMP: Broker error', frame.headers['message'], frame.body);
      const cb = callbacksRef.current.onError;
      if (cb) cb(frame);
    };

    client.onWebSocketClose = (event) => {
      console.log('STOMP: WebSocket closed', event);
      setIsConnected(false);
      const cb = callbacksRef.current.onDisconnect;
      if (cb) cb(event);
    };

    client.onWebSocketError = (error) => {
      console.error('STOMP: WebSocket error', error);
      const cb = callbacksRef.current.onError;
      if (cb) cb(error);
    };

    clientRef.current = client;
    client.activate();
  }, [user, endpoint]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }

    if (clientRef.current) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    setIsConnected(false);
  }, []);

  const sendMessage = useCallback((destination, body) => {
    if (!clientRef.current || !clientRef.current.connected) {
      console.warn('STOMP: Cannot send message - not connected');
      return false;
    }

    try {
      clientRef.current.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body)
      });
      console.log('STOMP: Message sent', { destination, body });
      return true;
    } catch (error) {
      console.error('STOMP: Error sending message', error);
      return false;
    }
  }, []);

  useEffect(() => {
    if (user) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    connect,
    disconnect
  };
}

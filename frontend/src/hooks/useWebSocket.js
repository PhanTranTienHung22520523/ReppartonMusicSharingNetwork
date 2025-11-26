import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

/**
 * Custom hook for managing WebSocket connections
 * @param {string} url - WebSocket URL to connect to
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoConnect - Auto connect on mount (default: true)
 * @param {number} options.reconnectInterval - Reconnection interval in ms (default: 3000)
 * @param {number} options.maxReconnectAttempts - Max reconnection attempts (default: 5)
 * @param {Function} options.onMessage - Message handler callback
 * @param {Function} options.onOpen - Connection opened callback
 * @param {Function} options.onClose - Connection closed callback
 * @param {Function} options.onError - Error callback
 */
export function useWebSocket(url, options = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onOpen,
    onClose,
    onError
  } = options;

  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const shouldReconnectRef = useRef(true);

  const connect = useCallback(() => {
    if (!user || !url) {
      console.log('WebSocket: Cannot connect - missing user or URL');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('WebSocket: Already connected');
      return;
    }

    try {
      setConnectionStatus('connecting');
      console.log(`WebSocket: Connecting to ${url}...`);
      
      // Add token to URL if available
      const token = localStorage.getItem('token');
      const wsUrl = token ? `${url}?token=${token}` : url;
      
      wsRef.current = new WebSocket(wsUrl);

      wsRef.current.onopen = (event) => {
        console.log('WebSocket: Connected successfully');
        setIsConnected(true);
        setConnectionStatus('connected');
        reconnectAttemptsRef.current = 0;
        
        // Send authentication message
        if (token) {
          wsRef.current.send(JSON.stringify({
            type: 'auth',
            token: token,
            userId: user.id
          }));
        }
        
        onOpen?.(event);
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket: Message received', data);
          setLastMessage(data);
          onMessage?.(data);
        } catch (error) {
          console.error('WebSocket: Error parsing message', error);
          setLastMessage(event.data);
          onMessage?.(event.data);
        }
      };

      wsRef.current.onerror = (event) => {
        console.error('WebSocket: Error occurred', event);
        setConnectionStatus('error');
        onError?.(event);
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket: Connection closed', event.code, event.reason);
        setIsConnected(false);
        setConnectionStatus('disconnected');
        wsRef.current = null;
        onClose?.(event);

        // Attempt to reconnect
        if (shouldReconnectRef.current && 
            reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current++;
          console.log(`WebSocket: Reconnecting... Attempt ${reconnectAttemptsRef.current}/${maxReconnectAttempts}`);
          setConnectionStatus('reconnecting');
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          console.log('WebSocket: Max reconnection attempts reached');
          setConnectionStatus('failed');
        }
      };

    } catch (error) {
      console.error('WebSocket: Connection error', error);
      setConnectionStatus('error');
      onError?.(error);
    }
  }, [url, user, reconnectInterval, maxReconnectAttempts, onMessage, onOpen, onClose, onError]);

  const disconnect = useCallback(() => {
    console.log('WebSocket: Disconnecting...');
    shouldReconnectRef.current = false;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, []);

  const sendMessage = useCallback((message) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket: Cannot send message - not connected');
      return false;
    }

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      wsRef.current.send(data);
      console.log('WebSocket: Message sent', message);
      return true;
    } catch (error) {
      console.error('WebSocket: Error sending message', error);
      return false;
    }
  }, []);

  const reconnect = useCallback(() => {
    console.log('WebSocket: Manual reconnection triggered');
    shouldReconnectRef.current = true;
    reconnectAttemptsRef.current = 0;
    disconnect();
    setTimeout(connect, 100);
  }, [connect, disconnect]);

  // Auto connect on mount
  useEffect(() => {
    if (autoConnect && user) {
      connect();
    }

    return () => {
      shouldReconnectRef.current = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [autoConnect, user, connect]);

  return {
    isConnected,
    connectionStatus,
    lastMessage,
    sendMessage,
    connect,
    disconnect,
    reconnect
  };
}

export default useWebSocket;

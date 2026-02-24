import { API_ENDPOINTS, WS_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.notifications;
const WS_URL = WS_ENDPOINTS.notifications;

function getUserIdFromToken() {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;

    // Base64URL decode
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const json = JSON.parse(atob(padded));
    return typeof json?.sub === 'string' && json.sub ? json.sub : null;
  } catch {
    return null;
  }
}

const getStoredUserId = () => {
  // Prefer JWT subject to avoid mismatch between stored user shapes and backend identity.
  const tokenSub = getUserIdFromToken();
  if (tokenSub) return tokenSub;

  const user = localStorage.getItem('user');
  if (!user) return null;

  try {
    const userData = JSON.parse(user);
    return (
      userData.id ||
      userData.userId ||
      userData._id ||
      userData.email ||
      null
    );
  } catch {
    return null;
  }
};

// Get user notifications
export async function getUserNotifications(page = 0, size = 20) {
  try {
    const userId = getStoredUserId();
    if (!userId) {
      console.warn('[NotificationService] No user in localStorage');
      return { content: [], totalElements: 0 };
    }
    
    const url = `${API_URL}/user/${encodeURIComponent(userId)}?page=${page}&size=${size}`;
    console.log('[NotificationService] Fetching notifications from:', url);
    console.log('[NotificationService] UserId:', userId);
    
    const headers = createHeaders(true);
    console.log('[NotificationService] Request headers:', headers);
    
    const res = await fetch(url, { headers });
    
    console.log('[NotificationService] Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('[NotificationService] Error response:', errorText);
      throw new Error(`Failed to fetch notifications: ${res.status} ${res.statusText}`);
    }
    
    const data = await res.json();
    console.log('[NotificationService] Success! Received notifications:', data);
    return data;
  } catch (error) {
    console.error('[NotificationService] Exception:', error);
    throw new Error(error.message || "Network error");
  }
}

// Get unread notifications count
export async function getUnreadCount() {
  try {
    const userId = getStoredUserId();
    if (!userId) {
      return 0;
    }
    
    const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}/unread/count`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch unread count");
    }
    
    const data = await res.json();
    return typeof data === 'number' ? data : (data.count || 0);
  } catch (error) {
    console.error("Error fetching unread count:", error);
    return 0;
  }
}

// Mark notification as read
export async function markAsRead(notificationId) {
  try {
    const res = await fetch(`${API_URL}/${notificationId}/read`, {
      method: "PUT",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to mark as read");
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Mark all notifications as read
export async function markAllAsRead() {
  try {
    const userId = getStoredUserId();
    if (!userId) {
      return { success: true };
    }

    const res = await fetch(`${API_URL}/user/${encodeURIComponent(userId)}/read-all`, {
      method: "PUT",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to mark all as read");
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Delete notification
export async function deleteNotification(notificationId) {
  try {
    const res = await fetch(`${API_URL}/${notificationId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to delete notification");
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Delete all notifications
export async function deleteAllNotifications() {
  try {
    const res = await fetch(`${API_URL}/delete-all`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to delete all notifications");
    }
    
    return { success: true };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// WebSocket connection for real-time notifications
let ws = null;
let reconnectInterval = null;

export function connectNotificationWebSocket(onMessage, onError) {
  const token = getAuthToken();
  
  if (!token) {
    console.log('No auth token, skipping WebSocket connection');
    return null;
  }
  
  try {
    // Close existing connection if any
    if (ws) {
      ws.close();
    }
    
    // Create new WebSocket connection
    ws = new WebSocket(`${WS_URL}?token=${token}`);
    
    ws.onopen = () => {
      console.log('Notification WebSocket connected');
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
      }
    };
    
    ws.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        if (onMessage) {
          onMessage(notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Notification WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };
    
    ws.onclose = () => {
      console.log('Notification WebSocket closed');
      // Try to reconnect after 5 seconds
      if (!reconnectInterval) {
        reconnectInterval = setInterval(() => {
          console.log('Attempting to reconnect WebSocket...');
          connectNotificationWebSocket(onMessage, onError);
        }, 5000);
      }
    };
    
    return ws;
  } catch (error) {
    console.error('Failed to connect WebSocket:', error);
    if (onError) {
      onError(error);
    }
    return null;
  }
}

export function disconnectNotificationWebSocket() {
  if (reconnectInterval) {
    clearInterval(reconnectInterval);
    reconnectInterval = null;
  }
  
  if (ws) {
    ws.close();
    ws = null;
  }
}

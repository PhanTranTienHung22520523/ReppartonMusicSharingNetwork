const API_URL = `${import.meta.env.VITE_API_BASE_URL}/notifications`;

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Get user notifications
export async function getUserNotifications(page = 0, size = 20) {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      return { content: [], totalElements: 0 };
    }
    
    const userData = JSON.parse(user);
    const userId = userData.id || userData.email; // fallback to email if id not available
    
    if (!userId) {
      console.error("No userId found in user data:", userData);
      return { content: [], totalElements: 0 };
    }
    
    const res = await fetch(`${API_URL}/${userId}?page=${page}&size=${size}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch notifications");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get unread notifications count
export async function getUnreadCount() {
  try {
    const user = localStorage.getItem("user");
    if (!user) {
      return 0;
    }
    
    const userData = JSON.parse(user);
    const userId = userData.id || userData.email; // fallback to email if id not available
    
    if (!userId) {
      console.error("No userId found in user data:", userData);
      return 0;
    }
    
    const res = await fetch(`${API_URL}/unread/count?userId=${userId}`, {
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
    const res = await fetch(`${API_URL}/read-all`, {
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

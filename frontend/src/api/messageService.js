import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.messages;

// Send a message
export async function sendMessage(receiverId, content) {
  try {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('content', content);
    
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/send`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to send message");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get conversations
export async function getConversations(page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/conversations?page=${page}&size=${size}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch conversations");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Legacy function for compatibility
export async function getConversationsByUserId() {
  return getConversations();
}

// Get messages with a specific user
export async function getMessagesWithUser(userId) {
  try {
    console.log("Fetching messages with user:", userId);
    const res = await fetch(`${API_URL}/conversation?receiverId=${userId}`, {
      headers: createHeaders(true),
    });
    
    console.log("Messages API response status:", res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Messages API error:", errorText);
      throw new Error(`Failed to fetch messages: ${res.status} ${errorText}`);
    }
    
    const data = await res.json();
    console.log("Messages API data:", data);
    return data;
  } catch (error) {
    console.error("Messages API error:", error);
    throw new Error(error.message || "Network error");
  }
}

// Legacy function for compatibility
export async function getMessages(convId) {
  return getMessagesWithUser(convId);
}

// Start a conversation with another artist
export async function startConversation(receiverId) {
  try {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/start`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` })
      },
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to start conversation");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}
// API Configuration
// This file centralizes all API-related configuration

// Base URL for all API calls (via API Gateway)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

// Service endpoints (all routed through API Gateway)
export const API_ENDPOINTS = {
  // User Service (port 8081)
  users: `${API_BASE_URL}/users`,
  auth: `${API_BASE_URL}/auth`,
  
  // Song Service (port 8082)
  songs: `${API_BASE_URL}/songs`,
  genres: `${API_BASE_URL}/genres`,
  
  // Social Service (port 8083)
  social: `${API_BASE_URL}/social`,
  follows: `${API_BASE_URL}/social/follows`,
  likes: `${API_BASE_URL}/social/likes`,
  shares: `${API_BASE_URL}/social/shares`,
  
  // Playlist Service (port 8084)
  playlists: `${API_BASE_URL}/playlists`,
  
  // Comment Service (port 8085)
  comments: `${API_BASE_URL}/comments`,
  
  // Notification Service (port 8086)
  notifications: `${API_BASE_URL}/notifications`,
  
  // Message Service (port 8087)
  messages: `${API_BASE_URL}/messages`,
  
  // Post Service (port 8088)
  posts: `${API_BASE_URL}/posts`,
  
  // Story Service (port 8089)
  stories: `${API_BASE_URL}/stories`,
  
  // Search Service (port 8090)
  search: `${API_BASE_URL}/search`,
  
  // Recommendation Service (port 8091)
  recommendations: `${API_BASE_URL}/recommendations`,
  
  // Analytics Service (port 8092)
  analytics: `${API_BASE_URL}/analytics`,
  
  // Event Service (port 8093)
  events: `${API_BASE_URL}/events`,
  
  // File Storage Service (port 8094)
  files: `${API_BASE_URL}/files`,
  
  // Report Service (port 8095)
  reports: `${API_BASE_URL}/reports`,
  
  // AI Service (Python Flask - port 5000)
  ai: 'http://localhost:5000/api/ai'
};

// WebSocket endpoints
export const WS_ENDPOINTS = {
  notifications: `ws://localhost:8090/ws/notifications`,
  messages: `ws://localhost:8090/ws/messages`
};

// Helper function to get auth token
export const getAuthToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

// Helper function to create headers with auth
export const createHeaders = (includeAuth = false, isFormData = false) => {
  const headers = {};
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function for API error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.message || 'An error occurred';
    throw new Error(message);
  } else if (error.request) {
    // Request made but no response
    throw new Error('No response from server. Please check your connection.');
  } else {
    // Something else happened
    throw new Error(error.message || 'An unexpected error occurred');
  }
};

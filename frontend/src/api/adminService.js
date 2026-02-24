import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.users.replace('/users', '/admin');

// Get current user ID
const getUserId = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  return user.id;
};

// ========== USER MANAGEMENT ==========

export const getAllUsers = async (page = 0, size = 20) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/users?page=${page}&size=${size}`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const searchUsers = async (keyword, page = 0, size = 20) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/users/search?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to search users');
  return response.json();
};

export const banUser = async (userId, reason) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/users/${userId}/ban`, {
    method: 'POST',
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) throw new Error('Failed to ban user');
  return response.json();
};

export const unbanUser = async (userId) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/users/${userId}/unban`, {
    method: 'POST',
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to unban user');
  return response.json();
};

export const deleteUser = async (userId) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
};

export const getUserActivity = async (userId) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/users/${userId}/activity`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch user activity');
  return response.json();
};

// ========== ARTIST VERIFICATION ==========

export const getPendingArtists = async (page = 0, size = 20) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/artists/pending?page=${page}&size=${size}`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch pending artists');
  return response.json();
};

export const getApprovedArtists = async (page = 0, size = 20) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/artists/approved?page=${page}&size=${size}`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch approved artists');
  return response.json();
};

export const getRejectedArtists = async (page = 0, size = 20) => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/artists/rejected?page=${page}&size=${size}`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch rejected artists');
  return response.json();
};

export const approveArtist = async (userId) => {
  const adminId = getUserId();
  const AUTH_URL = API_ENDPOINTS.auth;
  const response = await fetch(`${AUTH_URL}/artist/approve/${userId}`, {
    method: 'POST',
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to approve artist');
  return response.json();
};

export const rejectArtist = async (userId, reason) => {
  const adminId = getUserId();
  const AUTH_URL = API_ENDPOINTS.auth;
  const response = await fetch(`${AUTH_URL}/artist/reject/${userId}`, {
    method: 'POST',
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
    body: JSON.stringify({ reason }),
  });
  
  if (!response.ok) throw new Error('Failed to reject artist');
  return response.json();
};

// ========== SYSTEM STATISTICS ==========

export const getSystemStats = async () => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/stats`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch system stats');
  return response.json();
};

export const getUserStats = async () => {
  const adminId = getUserId();
  const response = await fetch(`${API_URL}/stats/users`, {
    headers: {
      ...createHeaders(true),
      'X-User-Id': adminId,
    },
  });
  
  if (!response.ok) throw new Error('Failed to fetch user stats');
  return response.json();
};

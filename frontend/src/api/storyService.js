import { API_ENDPOINTS, getAuthToken } from '../config/api.config';

const API_BASE_URL = API_ENDPOINTS.stories;

// Create story
export const createStory = async (storyData) => {
  const token = getAuthToken();
  const formData = new FormData();
  
  formData.append("type", "image");
  if (storyData.content) formData.append("textContent", storyData.content);
  if (storyData.image) formData.append("contentFile", storyData.image);
  formData.append("isPrivate", storyData.isPrivate || false);
  
  const response = await fetch(`${API_BASE_URL}/create-auth`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error("Failed to create story");
  }
  
  return response.json();
};

// Get user's stories
export const getUserStories = async (userId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/user/${userId}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to get user stories");
  }
  
  return response.json();
};

// Get following users' stories
export const getFollowingStories = async () => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/following`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to get following stories");
  }
  
  return response.json();
};

// Get all public stories
export const getAllStories = async () => {
  const response = await fetch(`${API_BASE_URL}/public`);
  
  if (!response.ok) {
    throw new Error("Failed to get stories");
  }
  
  return response.json();
};

// Delete story
export const deleteStory = async (storyId) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/${storyId}`, {
    method: "DELETE",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to delete story");
  }
  
  return response.json();
};

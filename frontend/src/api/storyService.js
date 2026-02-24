import { API_ENDPOINTS, getAuthToken } from '../config/api.config';

const API_BASE_URL = API_ENDPOINTS.stories;

// Create story
export const createStory = async (storyData) => {
  const token = getAuthToken();
  const userStr = localStorage.getItem('user');
  if (!userStr) throw new Error('Not authenticated');
  
  const user = JSON.parse(userStr);

  // Allow either a plain object (preferred) or a FormData (legacy/mistaken call sites).
  // Backend expects: type, textContent, contentFile, isPrivate.
  const formData = new FormData();
  if (storyData instanceof FormData) {
    const mediaType = storyData.get('mediaType');
    const content = storyData.get('content') || storyData.get('caption') || storyData.get('textContent');
    const media = storyData.get('media') || storyData.get('contentFile');
    const type = (storyData.get('type') || mediaType || 'image').toString().toLowerCase();
    formData.append('type', type);
    if (content) formData.append('textContent', content);
    if (media instanceof File) formData.append('contentFile', media);
    formData.append('isPrivate', storyData.get('isPrivate') || false);
  } else {
    formData.append("type", storyData?.type || "image");
    if (storyData?.content) formData.append("textContent", storyData.content);
    if (storyData?.image) formData.append("contentFile", storyData.image);
    if (storyData?.video) formData.append("contentFile", storyData.video);
    formData.append("isPrivate", storyData?.isPrivate || false);
  }
  
  const response = await fetch(`${API_BASE_URL}/create-auth`, {
    method: "POST",
    headers: {
      'X-User-Id': user.id,
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
export const getFollowingStories = async (followedUserIds) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/following`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(followedUserIds || []),
  });
  
  if (!response.ok) {
    throw new Error("Failed to get following stories");
  }
  
  return response.json();
};

// Get all public stories
export const getAllStories = async () => {
  const response = await fetch(`${API_BASE_URL}/all`);
  
  if (!response.ok) {
    throw new Error("Failed to get stories");
  }
  
  return response.json();
};

// Delete story
export const deleteStory = async (storyId, userId) => {
  const token = getAuthToken();
  // Get userId from localStorage if not provided
  if (!userId) {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user.id;
    }
  }
  
  const response = await fetch(`${API_BASE_URL}/${storyId}/user/${userId}`, {
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

// Get my stories
export const getMyStories = async () => {
  const token = getAuthToken();
  const userStr = localStorage.getItem('user');
  if (!userStr) throw new Error('Not authenticated');
  
  const user = JSON.parse(userStr);
  const response = await fetch(`${API_BASE_URL}/user/${user.id}`, {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    throw new Error("Failed to get my stories");
  }
  
  return response.json();
};

// Get friends' stories (deprecated - use getFollowingStories instead)
export const getFriendsStories = async (followedUserIds) => {
  return getFollowingStories(followedUserIds);
};

// View story (record view)
export const viewStory = async (storyId) => {
  const token = getAuthToken();
  const userStr = localStorage.getItem('user');
  if (!userStr) return;
  
  const user = JSON.parse(userStr);
  const response = await fetch(`${API_BASE_URL}/${storyId}/view?userId=${user.id}`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
  
  if (!response.ok) {
    console.error("Failed to record story view");
  }
};

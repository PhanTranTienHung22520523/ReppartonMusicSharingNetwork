import { API_ENDPOINTS, createHeaders, getAuthToken } from '../config/api.config';

const API_URL = API_ENDPOINTS.groups;

// Get current user ID
const getUserId = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  const user = JSON.parse(userStr);
  return user.id;
};

// Create artist group
export const createGroup = async (groupData) => {
  // Backend expects: { name, description, initialMembers? }
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify({
      name: groupData.groupName,
      description: groupData.description,
      initialMembers: groupData.initialMembers || [],
      allowAllMembersChat: groupData.allowAllMembersChat !== false,
      allowedChatMemberIds: groupData.allowedChatMemberIds || []
    }),
  });
  
  if (!response.ok) throw new Error('Failed to create group');
  return response.json();
};

// Get pinned groups for an artist profile
export const getPinnedGroups = async (userId) => {
  const response = await fetch(`${API_URL}/pinned/${userId}`, {
    headers: createHeaders(false),
  });

  if (!response.ok) throw new Error('Failed to fetch pinned groups');
  return response.json();
};

// Get all groups
export const getAllGroups = async () => {
  const response = await fetch(`${API_URL}/public`, {
    headers: createHeaders(false),
  });
  
  if (!response.ok) throw new Error('Failed to fetch groups');
  return response.json();
};

// Get group by ID
export const getGroupById = async (groupId) => {
  const token = getAuthToken();
  const url = token ? `${API_URL}/${groupId}` : `${API_URL}/public/${groupId}`;
  const response = await fetch(url, {
    headers: createHeaders(!!token),
  });
  
  if (!response.ok) throw new Error('Failed to fetch group');
  return response.json();
};

// Get groups user is member of
export const getMyGroups = async () => {
  const response = await fetch(`${API_URL}`, {
    headers: createHeaders(true),
  });
  
  if (!response.ok) throw new Error('Failed to fetch my groups');
  return response.json();
};

// Join group
export const joinGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}/join`, {
    method: 'POST',
    headers: createHeaders(true),
  });
  
  if (!response.ok) throw new Error('Failed to join group');
  return response.json();
};

// Leave group
export const leaveGroup = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}/leave`, {
    method: 'POST',
    headers: createHeaders(true),
  });
  
  if (!response.ok) throw new Error('Failed to leave group');
  return response.json();
};

// Send message in group chat
export const sendGroupMessage = async (groupId, content, userName) => {
  const response = await fetch(`${API_URL}/${groupId}/messages`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify({ content }),
  });
  
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

// Get group messages
export const getGroupMessages = async (groupId) => {
  const response = await fetch(`${API_URL}/${groupId}/messages`, {
    headers: createHeaders(true),
  });
  
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

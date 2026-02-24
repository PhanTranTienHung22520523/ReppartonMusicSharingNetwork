import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.users;

// Get user by ID
export async function getUserById(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}` , {
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("User not found");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load user");
  }
}
// Block user
export async function blockUser(currentUserId, targetUserId) {
  try {
    const res = await fetch(`${API_URL}/${targetUserId}/block?userId=${currentUserId}`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to block user');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to block user');
  }
}

// Unblock user
export async function unblockUser(currentUserId, targetUserId) {
  try {
    const res = await fetch(`${API_URL}/${targetUserId}/block?userId=${currentUserId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to unblock user');
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to unblock user');
  }
}

// Get blocked users
export async function getBlockedUsers(userId) {
  try {
    const res = await fetch(`${API_URL}/blocked?userId=${userId}`, {
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to get blocked users');
    }
    
    return data.blockedUsers || [];
  } catch (error) {
    throw new Error(error.message || 'Failed to get blocked users');
  }
}

// Check if user is blocked
export async function isUserBlocked(currentUserId, targetUserId) {
  try {
    const res = await fetch(`${API_URL}/${targetUserId}/blocked?userId=${currentUserId}`, {
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to check block status');
    }
    
    return data.isBlocked || false;
  } catch (error) {
    console.error('Error checking block status:', error);
    return false;
  }
}
// Get user profile
export async function getUserProfile(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}/profile`, {
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("Profile not found");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load profile");
  }
}

// Update user profile
export async function updateUserProfile(userId, profileData) {
  try {
    const res = await fetch(`${API_URL}/${userId}/profile`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(profileData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to update profile");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update profile");
  }
}

// Get user settings (persisted in DB)
export async function getUserSettings(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}/settings`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      let msg = 'Failed to load settings';
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load settings');
  }
}

// Update user settings (persisted in DB)
export async function updateUserSettings(userId, settings) {
  try {
    const res = await fetch(`${API_URL}/${userId}/settings`, {
      method: 'PUT',
      headers: createHeaders(true),
      body: JSON.stringify(settings),
    });

    if (!res.ok) {
      let msg = 'Failed to update settings';
      try {
        const data = await res.json();
        msg = data.message || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to update settings');
  }
}

// Delete user account
export async function deleteUserAccount(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}`, {
      method: 'DELETE',
      headers: createHeaders(true),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to delete account');
    }
    return data;
  } catch (error) {
    throw new Error(error.message || 'Failed to delete account');
  }
}

// Search users
export async function searchUsers(query, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ q: query, page, size });
    const res = await fetch(`${API_URL}/search?${params.toString()}`, {
      headers: createHeaders(true)
    });
    
    if (!res.ok) {
      throw new Error("Search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Search failed");
  }
}

// Upload avatar
export async function uploadAvatar(userId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/${userId}/upload-avatar`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!res.ok) {
      let errorMsg = "Failed to upload avatar";
      try {
        const data = await res.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        // Response is not JSON, use status text
        errorMsg = res.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Upload avatar error:", error);
    throw new Error(error.message || "Failed to upload avatar");
  }
}

// Upload cover
export async function uploadCover(userId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/${userId}/upload-cover`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });
    
    if (!res.ok) {
      let errorMsg = "Failed to upload cover";
      try {
        const data = await res.json();
        errorMsg = data.message || errorMsg;
      } catch (e) {
        // Response is not JSON, use status text
        errorMsg = res.statusText || errorMsg;
      }
      throw new Error(errorMsg);
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Upload cover error:", error);
    throw new Error(error.message || "Failed to upload cover");
  }
}

// Apply to be artist
export async function applyToBeArtist(userId, artistData) {
  try {
    const AUTH_URL = API_ENDPOINTS.auth;
    const res = await fetch(`${AUTH_URL}/artist/apply`, {
      method: "POST",
      headers: {
        ...createHeaders(true),
        'X-User-Id': userId
      },
      body: JSON.stringify({
        artistName: artistData.artistName,
        documentUrl: artistData.documentUrl || '',
        socialMediaLinks: artistData.socialMediaLinks || '',
        verifiedSongsCount: artistData.verifiedSongsCount || 0
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to apply to be artist");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to apply");
  }
}

// Update user
export async function updateUser(userId, userData) {
  try {
    const res = await fetch(`${API_URL}/${userId}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(userData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to update user");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update user");
  }
}

// Get all users (admin only)
export async function getAllUsers(page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${API_URL}?${params.toString()}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch users");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load users");
  }
}
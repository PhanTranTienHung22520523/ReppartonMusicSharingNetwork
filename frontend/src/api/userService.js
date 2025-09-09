const API_URL = `${import.meta.env.VITE_API_BASE_URL}/users`;

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};

// Create headers with auth token
const createHeaders = (includeAuth = false) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Get user by ID
export async function getUserById(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}`);
    
    if (!res.ok) {
      throw new Error("User not found");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load user");
  }
}

// Get user profile
export async function getUserProfile(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}/profile`);
    
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

// Search users
export async function searchUsers(query, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ q: query, page, size });
    const res = await fetch(`${API_URL}/search?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Search failed");
  }
}

// Apply to be artist
export async function applyToBeArtist(userId) {
  try {
    const res = await fetch(`${API_URL}/${userId}/apply-artist`, {
      method: "POST",
      headers: createHeaders(true),
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
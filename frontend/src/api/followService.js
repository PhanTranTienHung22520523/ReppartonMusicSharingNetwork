const API_URL = `${import.meta.env.VITE_API_BASE_URL}/follow`;

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

// Follow a user
export async function followUser(followingId) {
  try {
    const res = await fetch(`${API_URL}/${followingId}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to follow user");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Unfollow a user
export async function unfollowUser(followingId) {
  try {
    const res = await fetch(`${API_URL}/${followingId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to unfollow user");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get followers of a user
export async function getFollowers(userId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/followers/${userId}?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch followers");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get following of a user
export async function getFollowing(userId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/following/${userId}?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch following");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Check if user is following another user
export async function isFollowing(followingId) {
  try {
    const res = await fetch(`${API_URL}/${followingId}/check`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      return false;
    }
    
    const data = await res.json();
    return data.isFollowing || false;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
}

// Get follow stats for a user
export async function getFollowStats(userId) {
  try {
    const res = await fetch(`${API_URL}/stats/${userId}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch follow stats");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get suggested users to follow
export async function getSuggestedUsers(page = 0, size = 10) {
  try {
    const res = await fetch(`${API_URL}/suggestions?page=${page}&size=${size}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch suggestions");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

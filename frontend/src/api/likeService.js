const API_URL = `${import.meta.env.VITE_API_BASE_URL}/likes`;

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

// Like a post
export async function likePost(postId) {
  try {
    const res = await fetch(`${API_URL}/post/${postId}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to like post");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Unlike a post
export async function unlikePost(postId) {
  try {
    const res = await fetch(`${API_URL}/post/${postId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to unlike post");
    }
    
    return { success: true, message: "Post unliked successfully" };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Like a song
export async function likeSong(songId) {
  try {
    const res = await fetch(`${API_URL}/song/${songId}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to like song");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Unlike a song
export async function unlikeSong(songId) {
  try {
    const res = await fetch(`${API_URL}/song/${songId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to unlike song");
    }
    
    return { success: true, message: "Song unliked successfully" };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get posts liked by user
export async function getLikedPosts(userId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/user/${userId}/posts?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch liked posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get songs liked by user
export async function getLikedSongs(userId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/user/${userId}/songs?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch liked songs");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Check if user liked a post
export async function isPostLiked(postId, userId) {
  try {
    const res = await fetch(`${API_URL}/post/${postId}/user/${userId}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      return false;
    }
    
    const data = await res.json();
    return data.liked || false;
  } catch (error) {
    console.error("Error checking if post is liked:", error);
    return false;
  }
}

// Check if user liked a song
export async function isSongLiked(songId, userId) {
  try {
    const res = await fetch(`${API_URL}/song/${songId}/user/${userId}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      return false;
    }
    
    const data = await res.json();
    return data.liked || false;
  } catch (error) {
    console.error("Error checking if song is liked:", error);
    return false;
  }
}

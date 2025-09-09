const API_URL = `${import.meta.env.VITE_API_BASE_URL}/posts`;

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

// Create headers for FormData
const createFormHeaders = (includeAuth = true) => {
  const headers = {};
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Create a new post
export async function createPost(content, mediaFile = null) {
  try {
    const formData = new FormData();
    formData.append('content', content);
    if (mediaFile) {
      formData.append('mediaFile', mediaFile);
    }

    const res = await fetch(`${API_URL}`, {
      method: "POST",
      headers: createFormHeaders(true),
      body: formData,
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to create post");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get all public posts (for discover page)
export async function getAllPublicPosts(page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/public?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get posts by user (for profile page)
export async function getPostsByUser(userId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/user/${userId}?page=${page}&size=${size}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch user posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get user feed (following users' posts)
export async function getUserFeed(page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/feed?page=${page}&size=${size}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch feed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get trending posts
export async function getTrendingPosts(page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/trending?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch trending posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get post by ID
export async function getPostById(postId) {
  try {
    const res = await fetch(`${API_URL}/${postId}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch post");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Update post
export async function updatePost(postId, content) {
  try {
    const res = await fetch(`${API_URL}/${postId}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify({ content }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to update post");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Delete post
export async function deletePost(postId) {
  try {
    const res = await fetch(`${API_URL}/${postId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to delete post");
    }
    
    return { success: true, message: "Post deleted successfully" };
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

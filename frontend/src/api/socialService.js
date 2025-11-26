import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

// ========== POSTS API ==========
const POSTS_API_URL = API_ENDPOINTS.posts;

// Get all posts
export async function getAllPosts(page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${POSTS_API_URL}?${params.toString()}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load posts");
  }
}

// Get personalized feed
export async function getFeed(page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${POSTS_API_URL}/feed?${params.toString()}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch feed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load feed");
  }
}

// Get trending posts
export async function getTrendingPosts() {
  try {
    const res = await fetch(`${POSTS_API_URL}/trending`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch trending posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load trending posts");
  }
}

// Create post
export async function createPost(postData) {
  try {
    const res = await fetch(POSTS_API_URL, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(postData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to create post");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to create post");
  }
}

// Get post by ID
export async function getPostById(postId) {
  try {
    const res = await fetch(`${POSTS_API_URL}/${postId}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Post not found");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load post");
  }
}

// Update post
export async function updatePost(postId, postData) {
  try {
    const res = await fetch(`${POSTS_API_URL}/${postId}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(postData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to update post");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update post");
  }
}

// Delete post
export async function deletePost(postId) {
  try {
    const res = await fetch(`${POSTS_API_URL}/${postId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to delete post");
    }
    
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete post");
  }
}

// Get posts by user
export async function getPostsByUser(userId, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${POSTS_API_URL}/user/${userId}?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch user posts");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load user posts");
  }
}

// ========== LIKES API ==========
const LIKES_API_URL = `${import.meta.env.VITE_API_BASE_URL}/likes`;

// Like/unlike post
export async function togglePostLike(postId) {
  try {
    const res = await fetch(`${LIKES_API_URL}/post/${postId}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to toggle like");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to toggle like");
  }
}

// Like/unlike song
export async function toggleSongLike(songId) {
  try {
    const res = await fetch(`${LIKES_API_URL}/song/${songId}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to toggle like");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to toggle like");
  }
}

// Check if post is liked
export async function checkPostLike(postId) {
  try {
    const res = await fetch(`${LIKES_API_URL}/post/${postId}/check`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to check like status");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to check like status");
  }
}

// Check if song is liked
export async function checkSongLike(songId) {
  try {
    const res = await fetch(`${LIKES_API_URL}/song/${songId}/check`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to check like status");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to check like status");
  }
}

// ========== FOLLOWS API ==========
const FOLLOWS_API_URL = `${import.meta.env.VITE_API_BASE_URL}/follows`;

// Follow/unfollow user
export async function toggleFollow(userId) {
  try {
    const res = await fetch(`${FOLLOWS_API_URL}/${userId}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to toggle follow");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to toggle follow");
  }
}

// Check if following user
export async function checkFollowStatus(userId) {
  try {
    const res = await fetch(`${FOLLOWS_API_URL}/${userId}/check`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to check follow status");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to check follow status");
  }
}

// Get user's followers
export async function getUserFollowers(userId, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${FOLLOWS_API_URL}/${userId}/followers?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch followers");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load followers");
  }
}

// Get who user is following
export async function getUserFollowing(userId, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${FOLLOWS_API_URL}/${userId}/following?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch following");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load following");
  }
}

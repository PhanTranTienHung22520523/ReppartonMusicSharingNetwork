import { API_ENDPOINTS, createHeaders } from '../config/api.config';

// ========== POSTS API ==========
const POSTS_API_URL = API_ENDPOINTS.posts;
const SOCIAL_API_URL = API_ENDPOINTS.social;

const getStoredUser = () => {
  const stored = localStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

const requireUserId = () => {
  const user = getStoredUser();
  if (!user?.id) {
    throw new Error('User not authenticated');
  }
  return user.id;
};

const buildQueryString = (params = {}) => new URLSearchParams(params).toString();

const ITEM_TYPES = {
  POST: 'POST',
  SONG: 'SONG',
};

export async function getLikesCount(itemId, itemType) {
  const params = buildQueryString({ itemId, itemType });
  const res = await fetch(`${SOCIAL_API_URL}/likes/count?${params}`, {
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch likes count');
  }
  const data = await res.json();
  return typeof data?.count === 'number' ? data.count : 0;
}

export async function getSharesCount(itemId, itemType) {
  const params = buildQueryString({ itemId, itemType });
  const res = await fetch(`${SOCIAL_API_URL}/shares/count?${params}`, {
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch shares count');
  }
  const data = await res.json();
  return typeof data?.count === 'number' ? data.count : 0;
}

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
export async function getTrendingPosts(limit = 20, days = 0) {
  try {
    const params = new URLSearchParams({ limit, days });
    const res = await fetch(`${POSTS_API_URL}/trending?${params.toString()}`);

    if (!res.ok) {
      throw new Error("Failed to fetch trending posts");
    }

    const data = await res.json();
    return Array.isArray(data?.posts) ? data.posts : data;
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
    let userId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        userId = u?.id || u?.userId || null;
      }
    } catch { }

    if (!userId) throw new Error('User not authenticated');

    const url = `${POSTS_API_URL}/${postId}?userId=${encodeURIComponent(String(userId))}`;
    const res = await fetch(url, {
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

// ========== SHARES API ==========
export async function shareItem(itemId, itemType) {
  const res = await fetch(`${SOCIAL_API_URL}/share`, {
    method: "POST",
    headers: createHeaders(true),
    body: JSON.stringify({ itemId, itemType }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to share item");
  }

  return await res.json();
}

// ========== LIKES API ==========
const likeItem = async (itemId, itemType) => {
  const res = await fetch(`${SOCIAL_API_URL}/like`, {
    method: "POST",
    headers: createHeaders(true),
    body: JSON.stringify({ itemId, itemType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to like item");
  }
  return data;
};

const unlikeItem = async (itemId, itemType) => {
  const params = buildQueryString({ itemId, itemType });
  const res = await fetch(`${SOCIAL_API_URL}/like?${params}`, {
    method: "DELETE",
    headers: createHeaders(true),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to unlike item");
  }
  return { success: true };
};

const isItemLiked = async (itemId, itemType) => {
  const params = buildQueryString({ itemId, itemType });
  const res = await fetch(`${SOCIAL_API_URL}/is-liked?${params}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) {
    throw new Error("Failed to check like status");
  }
  const data = await res.json();
  return Boolean(data.liked);
};

export async function togglePostLike(postId) {
  const liked = await isItemLiked(postId, ITEM_TYPES.POST);
  return liked ? unlikeItem(postId, ITEM_TYPES.POST) : likeItem(postId, ITEM_TYPES.POST);
}

export async function toggleSongLike(songId) {
  const liked = await isItemLiked(songId, ITEM_TYPES.SONG);
  return liked ? unlikeItem(songId, ITEM_TYPES.SONG) : likeItem(songId, ITEM_TYPES.SONG);
}

export async function checkPostLike(postId) {
  const liked = await isItemLiked(postId, ITEM_TYPES.POST);
  return { liked };
}

export async function checkSongLike(songId) {
  const liked = await isItemLiked(songId, ITEM_TYPES.SONG);
  return { liked };
}

// ========== FOLLOWS API ==========
const followUserRequest = async (followerId, followingId) => {
  const res = await fetch(`${SOCIAL_API_URL}/follow`, {
    method: "POST",
    headers: createHeaders(true),
    body: JSON.stringify({ followerId, followingId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to follow user");
  }
  return data;
};

const unfollowUserRequest = async (followerId, followingId) => {
  const params = buildQueryString({ followerId, followingId });
  const res = await fetch(`${SOCIAL_API_URL}/follow?${params}`, {
    method: "DELETE",
    headers: createHeaders(true),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to unfollow user");
  }
  return { success: true };
};

const checkFollowingPair = async (followerId, followingId) => {
  const params = buildQueryString({ followerId, followingId });
  const res = await fetch(`${SOCIAL_API_URL}/is-following?${params}`, {
    // public GET endpoint — do not include Authorization to avoid invalid-token errors
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error("Failed to check follow status");
  }
  const data = await res.json();
  return Boolean(data.following);
};

export async function toggleFollow(targetUserId) {
  const followerId = requireUserId();
  if (followerId === targetUserId) {
    throw new Error('Cannot follow yourself');
  }
  const currentlyFollowing = await checkFollowingPair(followerId, targetUserId);
  return currentlyFollowing
    ? unfollowUserRequest(followerId, targetUserId)
    : followUserRequest(followerId, targetUserId);
}

export async function checkFollowStatus(userId) {
  const followerId = requireUserId();
  const following = await checkFollowingPair(followerId, userId);
  return { following };
}

export async function getUserFollowers(userId) {
  const res = await fetch(`${SOCIAL_API_URL}/followers/${userId}`, {
    // followers endpoint is public GET — avoid sending Authorization
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch followers');
  }
  return await res.json();
}

export async function getUserFollowing(userId) {
  const res = await fetch(`${SOCIAL_API_URL}/following/${userId}`, {
    // following endpoint is public GET — avoid sending Authorization
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch following');
  }
  return await res.json();
}

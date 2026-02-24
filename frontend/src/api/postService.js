import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';
import { shareItem } from './socialService';

const SOCIAL_API_URL = API_ENDPOINTS.social;

const API_URL = API_ENDPOINTS.posts;

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
export async function createPost(payloadOrContent, mediaFile = null, songId = null) {
  try {
    // Normalize input: allow either createPost(contentString) or createPost({ content, type, songId })
    let payload = {};
    if (payloadOrContent && typeof payloadOrContent === 'object' && !Array.isArray(payloadOrContent)) {
      payload = { ...payloadOrContent };
    } else {
      payload = { content: String(payloadOrContent ?? '') };
    }

    // Extract current user info (if available) to include in payload
    let currentUser = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        currentUser = JSON.parse(userStr);
        if (currentUser && (currentUser.id || currentUser.userId)) {
          payload.userId = currentUser.id || currentUser.userId;
          payload.username = currentUser.username || currentUser.userName || currentUser.name;
          payload.userProfilePic = currentUser.avatarUrl || currentUser.userProfilePic || currentUser.profileImageUrl;
        }
      }
    } catch (e) {
      // ignore parse errors - not critical
    }

    // If caller passed songId separately, prefer explicit arg
    if (songId) payload.songId = songId;

    // Build final payload to match canonical post structure used in DB/UI
    const buildFinalPayload = (overrides = {}, user = currentUser) => {
      const username = (user && (user.username || user.userName || user.name)) || payload.username || overrides.username || null;
      const userProfilePic = (user && (user.avatarUrl || user.userProfilePic || user.profileImageUrl)) || payload.userProfilePic || overrides.userProfilePic || null;

      return {
        // identity
        userId: payload.userId || overrides.userId || null,
        username: username,
        userProfilePic: userProfilePic,

        // content & media
        content: payload.content || overrides.content || '',
        imageUrls: Array.isArray(payload.imageUrls) ? payload.imageUrls : (payload.imageUrl ? [payload.imageUrl] : (overrides.imageUrls || [])),
        videoUrl: payload.videoUrl || overrides.videoUrl || null,
        // compatibility fields expected by backend
        mediaUrl: overrides.mediaUrl || payload.mediaUrl || null,
        mediaType: overrides.mediaType || payload.mediaType || null,
        songId: payload.songId || overrides.songId || null,
        playlistId: payload.playlistId || overrides.playlistId || null,
        sharedPostId: payload.sharedPostId || overrides.sharedPostId || null,
        sharedPost: payload.sharedPost || overrides.sharedPost || null,
        type: payload.type || overrides.type || 'POST',

        // location
        location: overrides.location || (payload.location || (payload.locationName || payload.latitude || payload.longitude ? {
          latitude: payload.latitude || null,
          longitude: payload.longitude || null,
          locationName: payload.locationName || payload.location || null
        } : null)),

        // counts (initialized on client but backend may override)
        likesCount: payload.likesCount ?? 0,
        commentsCount: payload.commentsCount ?? 0,
        sharesCount: payload.sharesCount ?? 0,
        viewsCount: payload.viewsCount ?? 0,

        // privacy
        isPrivate: payload.isPrivate ?? false,

        // allow extra fields if present
        ...overrides,
      };
    };

    // If no media file, send JSON (backend expects application/json)
    if (!mediaFile) {
      const finalPayload = buildFinalPayload();
      const res = await fetch(`${API_URL}`, {
        method: "POST",
        headers: createHeaders(true),
        body: JSON.stringify(finalPayload),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.message || "Failed to create post");
      }
      return data;
    }

    // If there is a media file, upload it to file-storage service first
    const fileForm = new FormData();
    fileForm.append('file', mediaFile);
    const uploadRes = await fetch(`${API_ENDPOINTS.files}/upload`, {
      method: 'POST',
      headers: createFormHeaders(true),
      body: fileForm,
    });

    const uploadData = await uploadRes.json().catch(() => null);
    if (!uploadRes.ok || !uploadData) {
      throw new Error(uploadData?.message || 'Failed to upload media');
    }

    const mediaUrl = uploadData.url || uploadData.data?.url || null;
    // Decide where to put the uploaded URL based on file type
    const mime = mediaFile && mediaFile.type ? mediaFile.type : '';
    const overrides = {};
    if (mediaUrl) {
      if (mime.startsWith('image')) {
        overrides.imageUrls = [mediaUrl];
        overrides.mediaUrl = mediaUrl;
        overrides.mediaType = 'image';
      } else if (mime.startsWith('video')) {
        overrides.videoUrl = mediaUrl;
        overrides.mediaUrl = mediaUrl;
        overrides.mediaType = 'video';
      } else {
        // generic media stored in imageUrls by default
        overrides.imageUrls = [mediaUrl];
        overrides.mediaUrl = mediaUrl;
        overrides.mediaType = 'other';
      }
    }

    const finalPayload = buildFinalPayload(overrides);

    const res = await fetch(`${API_URL}`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(finalPayload),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      throw new Error(data?.message || "Failed to create post");
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
export async function getUserFeed(followingUserIds, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/feed?page=${page}&size=${size}`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify({ userIds: followingUserIds || [] }),
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
export async function getTrendingPosts(limit = 20, days = 0) {
  try {
    const params = new URLSearchParams({ limit, days });
    const res = await fetch(`${API_URL}/trending?${params.toString()}`, {
      headers: createHeaders(false),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch trending posts");
    }

    const data = await res.json();
    // Backend returns { success: true, posts: [...] }
    return Array.isArray(data?.posts) ? data.posts : (data?.content || []);
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

// Get post statistics (likes/shares/comments maintained by post-service)
export async function getPostStatistics(postId) {
  try {
    const res = await fetch(`${API_URL}/${postId}/statistics`, {
      headers: createHeaders(false),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch post statistics");
    }

    const stats = await res.json();

    // Align likes/shares with social-service (source of truth used by UI toggles)
    try {
      const params = new URLSearchParams({ itemId: postId, itemType: 'POST' });
      const [likesRes, sharesRes] = await Promise.all([
        fetch(`${SOCIAL_API_URL}/likes/count?${params.toString()}`, { headers: createHeaders(false) }),
        fetch(`${SOCIAL_API_URL}/shares/count?${params.toString()}`, { headers: createHeaders(false) }),
      ]);

      if (likesRes.ok) {
        const likesData = await likesRes.json();
        if (typeof likesData?.count === 'number') stats.likes = likesData.count;
      }
      if (sharesRes.ok) {
        const sharesData = await sharesRes.json();
        if (typeof sharesData?.count === 'number') stats.shares = sharesData.count;
      }
    } catch {
      // best-effort
    }

    return stats;
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
    // Backend requires `userId` as request param for authorization checks
    let userId = null;
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const u = JSON.parse(userStr);
        userId = u?.id || u?.userId || null;
      }
    } catch { }

    if (!userId) throw new Error('User not authenticated');

    const url = `${API_URL}/${postId}?userId=${encodeURIComponent(String(userId))}`;

    const res = await fetch(url, {
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

// Share post
export async function sharePost(postId, content = "") {
  try {
    // 1. Create the share post (Post Service)
    const newPost = await createPost({
      content,
      sharedPostId: postId,
      type: 'SHARE'
    });

    // 2. Record the share (Social Service)
    // We share the ORIGINAL post ID, so the count increases for that post
    try {
      await shareItem(postId, 'POST');
    } catch (e) {
      console.warn("Failed to record share in social service", e);
    }

    return newPost;
  } catch (error) {
    throw new Error(error.message || "Share failed");
  }
}

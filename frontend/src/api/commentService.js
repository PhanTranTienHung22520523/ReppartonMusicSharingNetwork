import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.comments;

// Add comment to post
export async function addCommentToPost(postId, content) {
  try {
    const res = await fetch(`${API_URL}/post/${postId}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content: content
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to add comment");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Add comment to song
export async function addCommentToSong(songId, content) {
  try {
    const res = await fetch(`${API_URL}/song/${songId}/auth`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content: content
      }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to add comment");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get comments for post
export async function getPostComments(postId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/post/${postId}?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch comments");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get comments for song (legacy function name for compatibility)
export async function getCommentsBySong(songId, page = 0, size = 20) {
  return getSongComments(songId, page, size);
}

// Get comments for song
export async function getSongComments(songId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/song/${songId}?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch comments");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Legacy function for compatibility
export async function createComment({ songId, content }) {
  return addCommentToSong(songId, content);
}

// Add comment to playlist
export async function addCommentToPlaylist(playlistId, content, parentId = null) {
  try {
    console.log('DEBUG: Adding comment to playlist:', playlistId);
    console.log('DEBUG: Content:', content);
    
    const token = getAuthToken();
    console.log('DEBUG: Token exists:', !!token);
    console.log('DEBUG: Token value:', token ? token.substring(0, 20) + '...' : 'null');
    
    // Use URL parameters instead of JSON body
    const params = new URLSearchParams();
    params.append('content', content);
    if (parentId) {
      params.append('parentId', parentId);
    }

    console.log('DEBUG: Request URL:', `${API_URL}/playlist/${playlistId}`);
    console.log('DEBUG: Request params:', params.toString());

    const res = await fetch(`${API_URL}/playlist/${playlistId}`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });
    
    console.log('DEBUG: Response status:', res.status);
    console.log('DEBUG: Response ok:', res.ok);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('DEBUG: Error response:', errorText);
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }
    
    const data = await res.json();
    console.log('DEBUG: Success response:', data);
    return data;
  } catch (error) {
    console.error('DEBUG: Exception in addCommentToPlaylist:', error);
    throw new Error(error.message || "Network error");
  }
}

// Get comments for playlist
export async function getPlaylistComments(playlistId, page = 0, size = 20) {
  try {
    const res = await fetch(`${API_URL}/playlist/${playlistId}?page=${page}&size=${size}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch comments");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Delete comment
export async function deleteComment(commentId) {
  try {
    const res = await fetch(`${API_URL}/${commentId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to delete comment");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Like/Unlike comment
export async function likeComment(commentId) {
  try {
    const res = await fetch(`${API_URL}/${commentId}/like`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to like comment");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Add reply to comment
export async function addReplyToComment(commentId, content) {
  try {
    const res = await fetch(`${API_URL}/${commentId}/reply`, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        content: content
      }),
    });
    
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to add reply");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}
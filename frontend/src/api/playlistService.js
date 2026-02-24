import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.playlists;

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ?? parsed?.userId ?? null;
  } catch {
    return null;
  }
}

function unwrapResponse(json) {
  if (!json) return json;
  // Some services return ApiResponse { success, message, data }
  if (Object.prototype.hasOwnProperty.call(json, 'data')) return json.data;
  return json;
}

// Get user playlists
export async function getUserPlaylists(userId) {
  try {
    const resolvedUserId = userId ?? getCurrentUserId();
    if (!resolvedUserId) throw new Error('User not authenticated');

    // Backend exposes /api/playlists/user/{userId} (returns Page<Playlist>)
    const res = await fetch(`${API_URL}/user/${encodeURIComponent(resolvedUserId)}?page=0&size=50`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch playlists");
    }

    const json = await res.json();
    const payload = unwrapResponse(json);

    // Page format: { content: [...] }
    if (payload && Array.isArray(payload.content)) return payload.content;
    if (Array.isArray(payload)) return payload;
    return [];
  } catch (error) {
    throw new Error(error.message || "Failed to load playlists");
  }
}

// Create playlist
export async function createPlaylist(playlistData) {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Backend uses isPrivate; UI uses isPublic
    const payload = { ...playlistData };
    if (payload.isPublic !== undefined && payload.isPrivate === undefined) {
      payload.isPrivate = !payload.isPublic;
      delete payload.isPublic;
    }
    if (!payload.userId) payload.userId = userId;

    const res = await fetch(API_URL, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to create playlist");
    }

    return data.playlist ?? unwrapResponse(data);
  } catch (error) {
    throw new Error(error.message || "Failed to create playlist");
  }
}

// Get playlist by ID
export async function getPlaylistById(playlistId) {
  try {
    const res = await fetch(`${API_URL}/${playlistId}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Playlist not found");
    }
    
    return unwrapResponse(await res.json());
  } catch (error) {
    throw new Error(error.message || "Failed to load playlist");
  }
}

// Update playlist
export async function updatePlaylist(playlistId, playlistData) {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const payload = { ...playlistData };
    if (payload.isPublic !== undefined && payload.isPrivate === undefined) {
      payload.isPrivate = !payload.isPublic;
      delete payload.isPublic;
    }

    const res = await fetch(`${API_URL}/${playlistId}?userId=${encodeURIComponent(userId)}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(payload),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to update playlist");
    }

    return data.playlist ?? unwrapResponse(data);
  } catch (error) {
    throw new Error(error.message || "Failed to update playlist");
  }
}

// Delete playlist
export async function deletePlaylist(playlistId) {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const res = await fetch(`${API_URL}/${playlistId}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to delete playlist");
    }
    
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to delete playlist");
  }
}

// Add song to playlist
export async function addSongToPlaylist(playlistId, songId) {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    // Backend: POST /api/playlists/{playlistId}/songs/{songId}?userId=...
    const res = await fetch(`${API_URL}/${playlistId}/songs/${songId}?userId=${encodeURIComponent(userId)}`, {
      method: "POST",
      headers: createHeaders(true),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to add song to playlist");
    }

    return data.playlist ?? unwrapResponse(data);
  } catch (error) {
    throw new Error(error.message || "Failed to add song");
  }
}

// Remove song from playlist
export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    const userId = getCurrentUserId();
    if (!userId) throw new Error('User not authenticated');

    const res = await fetch(`${API_URL}/${playlistId}/songs/${songId}?userId=${encodeURIComponent(userId)}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to remove song from playlist");
    }
    
    return true;
  } catch (error) {
    throw new Error(error.message || "Failed to remove song");
  }
}
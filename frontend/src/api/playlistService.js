import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.playlists;

// Get user playlists
export async function getUserPlaylists() {
  try {
    const res = await fetch(API_URL, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error("Failed to fetch playlists");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load playlists");
  }
}

// Create playlist
export async function createPlaylist(playlistData) {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify(playlistData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to create playlist");
    }
    
    return data;
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
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load playlist");
  }
}

// Update playlist
export async function updatePlaylist(playlistId, playlistData) {
  try {
    const res = await fetch(`${API_URL}/${playlistId}`, {
      method: "PUT",
      headers: createHeaders(true),
      body: JSON.stringify(playlistData),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to update playlist");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to update playlist");
  }
}

// Delete playlist
export async function deletePlaylist(playlistId) {
  try {
    const res = await fetch(`${API_URL}/${playlistId}`, {
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
    const res = await fetch(`${API_URL}/${playlistId}/songs`, {
      method: "POST",
      headers: createHeaders(true),
      body: JSON.stringify({ songId }),
    });
    
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || "Failed to add song to playlist");
    }
    
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to add song");
  }
}

// Remove song from playlist
export async function removeSongFromPlaylist(playlistId, songId) {
  try {
    const res = await fetch(`${API_URL}/${playlistId}/songs/${songId}`, {
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
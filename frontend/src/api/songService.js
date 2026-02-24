import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.songs;

// Upload song
export async function uploadSong(formData) {
  try {
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: createHeaders(true, true),
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to upload song");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Upload failed");
  }
}

// Update lyrics (backend expects raw string body)
export async function updateSongLyrics(songId, lyrics) {
  const token = getAuthToken();
  if (!token) throw new Error("Unauthorized");

  const res = await fetch(`${API_URL}/${songId}/lyrics`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain; charset=UTF-8",
    },
    body: lyrics ?? "",
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = data?.message || "Failed to update lyrics";
    throw new Error(msg);
  }

  return data;
}

// Get all public songs
export async function getAllSongs(page = 0, size = 20) {
  try {
    console.log("Fetching songs from:", API_URL);
    const res = await fetch(`${API_URL}`, {
      headers: createHeaders(false)
    });

    console.log("Songs response status:", res.status, res.statusText);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Songs fetch failed:", res.status, errorText);
      throw new Error("Failed to fetch songs");
    }

    const response = await res.json();
    console.log("Songs API response:", response);

    // Backend returns ApiResponse<List<Song>> format: { success: true, message: "...", data: [...] }
    const songs = response.data || response;
    console.log("Processed songs:", songs);
    return songs;
  } catch (error) {
    console.error("Get all songs error:", error);
    throw error;
  }
}

// Get trending songs
export async function getTrendingSongs() {
  try {
    const token = getAuthToken();
    const res = await fetch(`${API_URL}/trending`, {
      headers: token ? createHeaders(true) : createHeaders(false),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch trending songs");
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load trending songs");
  }
}

// Get song recommendations
export async function getRecommendedSongs() {
  try {
    const res = await fetch(`${API_URL}/recommendations`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error("Failed to fetch recommendations");
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load recommendations");
  }
}

// Get songs by genre
export async function getSongsByGenre(genre) {
  try {
    const res = await fetch(`${API_URL}/genre/${encodeURIComponent(genre)}`, {
      headers: createHeaders(false)
    });

    if (!res.ok) {
      throw new Error("Failed to fetch songs by genre");
    }

    const response = await res.json();
    return response.data || response;
  } catch (error) {
    throw new Error(error.message || "Failed to load songs");
  }
}

// Get song by ID
export async function getSongById(songId) {
  try {
    const res = await fetch(`${API_URL}/${songId}`);

    if (!res.ok) {
      throw new Error("Song not found");
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load song");
  }
}

// Search songs
export async function searchSongs(query, page = 0, size = 20) {
  try {
    // Backend expects 'query' as the parameter name (see SongController.searchSongs)
    const params = new URLSearchParams({ query: query, page, size });
    const res = await fetch(`${API_URL}/search?${params.toString()}`);

    if (!res.ok) {
      const text = await res.text().catch(() => null);
      console.error("Song search failed:", res.status, text);
      throw new Error("Search failed");
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Search failed");
  }
}

// Get songs by artist (uses user endpoint)
export async function getSongsByArtist(artistId) {
  try {
    console.log("Fetching songs for artist:", artistId);
    const res = await fetch(`${API_URL}/user/${artistId}`, {
      headers: createHeaders(false)
    });

    console.log("API response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("API error response:", errorText);
      throw new Error(`Failed to fetch artist songs: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    console.log("API response data:", data);
    // Extract data from ApiResponse wrapper if present
    return data.data || data;
  } catch (error) {
    throw new Error(error.message || "Failed to load artist songs");
  }
}



// Record song play
export async function playSong(songId) {
  try {
    // Check if user is authenticated
    const token = getAuthToken();

    // Only try to record play if user is authenticated
    if (!token) {
      console.log("User not authenticated, skipping play recording");
      return null;
    }

    const res = await fetch(`${API_URL}/${songId}/play`, {
      method: "POST",
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error("Failed to record play");
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to record song play:", error);
    // Don't throw here as this is not critical for playback
    return null;
  }
}

// Update song
export async function updateSong(songId, formData) {
  try {
    const res = await fetch(`${API_URL}/${songId}`, {
      method: "PUT",
      headers: createHeaders(true, true),
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to update song");
    }

    return data;
  } catch (error) {
    throw new Error(error.message || "Update failed");
  }
}

// Delete song
export async function deleteSong(songId) {
  try {
    const res = await fetch(`${API_URL}/${songId}`, {
      method: "DELETE",
      headers: createHeaders(true),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || "Failed to delete song");
    }

    return true;
  } catch (error) {
    throw new Error(error.message || "Delete failed");
  }
}
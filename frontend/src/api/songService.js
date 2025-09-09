const API_URL = `${import.meta.env.VITE_API_BASE_URL}/songs`;

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};

// Create headers with auth token
const createHeaders = (includeAuth = false) => {
  const headers = {};
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Upload song
export async function uploadSong(formData) {
  try {
    const res = await fetch(`${API_URL}/upload`, {
      method: "POST",
      headers: createHeaders(true),
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

// Get all public songs
export async function getAllSongs(page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${API_URL}/public?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch songs");
    }
    
    const data = await res.json();
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to load songs");
  }
}

// Get trending songs
export async function getTrendingSongs() {
  try {
    const res = await fetch(`${API_URL}/trending`);
    
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
    const params = new URLSearchParams({ q: query, page, size });
    const res = await fetch(`${API_URL}/search?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Search failed");
  }
}

// Get songs by artist
export async function getSongsByArtist(artistId) {
  try {
    console.log("Fetching songs for artist:", artistId);
    const res = await fetch(`${API_URL}/artist/${artistId}`, {
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
    return data;
  } catch (error) {
    throw new Error(error.message || "Failed to load artist songs");
  }
}

// Get songs by genre
export async function getSongsByGenre(genreId, page = 0, size = 20) {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await fetch(`${API_URL}/genre/${genreId}?${params.toString()}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch genre songs");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Failed to load genre songs");
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
      headers: createHeaders(true),
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
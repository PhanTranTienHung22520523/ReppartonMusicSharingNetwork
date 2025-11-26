import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.recommendations;

// Get personalized song recommendations
export async function getPersonalizedRecommendations(limit = 20) {
  try {
    const res = await fetch(`${API_URL}/songs?limit=${limit}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch recommendations');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load recommendations');
  }
}

// Get similar songs recommendations
export async function getSimilarSongs(songId, limit = 10) {
  try {
    const res = await fetch(`${API_URL}/similar/${songId}?limit=${limit}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch similar songs');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load similar songs');
  }
}

// Get artist recommendations
export async function getRecommendedArtists(limit = 10) {
  try {
    const res = await fetch(`${API_URL}/artists?limit=${limit}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch artist recommendations');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load artist recommendations');
  }
}

// Get playlist recommendations
export async function getRecommendedPlaylists(limit = 10) {
  try {
    const res = await fetch(`${API_URL}/playlists?limit=${limit}`, {
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch playlist recommendations');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load playlist recommendations');
  }
}

// Get recommendations based on genre
export async function getRecommendationsByGenre(genreId, limit = 20) {
  try {
    const res = await fetch(`${API_URL}/genre/${genreId}?limit=${limit}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch genre recommendations');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load genre recommendations');
  }
}

// Get recommendations based on mood
export async function getRecommendationsByMood(mood, limit = 20) {
  try {
    const res = await fetch(`${API_URL}/mood/${mood}?limit=${limit}`, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch mood recommendations');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load mood recommendations');
  }
}

// Refresh user recommendations
export async function refreshRecommendations() {
  try {
    const res = await fetch(`${API_URL}/refresh`, {
      method: 'POST',
      headers: createHeaders(true),
    });
    
    if (!res.ok) {
      throw new Error('Failed to refresh recommendations');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to refresh recommendations');
  }
}

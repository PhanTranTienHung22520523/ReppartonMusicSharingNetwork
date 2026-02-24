import { API_ENDPOINTS, getAuthToken, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.analytics;

// Get user analytics overview
export async function getUserAnalytics(timeRange = 'week') {
  try {
    const res = await fetch(`${API_URL}/user?timeRange=${timeRange}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch analytics');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load analytics');
  }
}

// Get top songs analytics
export async function getTopSongs(timeRange = 'week', limit = 10) {
  try {
    const params = new URLSearchParams({ timeRange, limit });
    const res = await fetch(`${API_URL}/top-songs?${params.toString()}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch top songs');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load top songs');
  }
}

// Get listening history
export async function getListeningHistory(timeRange = 'week') {
  try {
    const res = await fetch(`${API_URL}/history?timeRange=${timeRange}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch listening history');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load listening history');
  }
}

// Get search analytics
export async function getSearchAnalytics(timeRange = 'week') {
  try {
    const res = await fetch(`${API_URL}/searches?timeRange=${timeRange}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch search analytics');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load search analytics');
  }
}

// Get trending songs (most viewed)
export async function getTrendingSongs(limit = 20) {
  try {
    const res = await fetch(`${API_ENDPOINTS.songs}/public/trending?limit=${limit}`, {
      headers: createHeaders(false), // Public endpoint, no auth required
    });

    if (!res.ok) {
      throw new Error('Failed to fetch trending songs');
    }

    const response = await res.json();
    // API returns {success, message, data: [...]}
    return response.data || [];
  } catch (error) {
    console.error('Error fetching trending songs:', error);
    return [];
  }
}

// Get genre analytics
export async function getGenreAnalytics(timeRange = 'week') {
  try {
    const res = await fetch(`${API_URL}/genres?timeRange=${timeRange}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch genre analytics');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load genre analytics');
  }
}

// Record page view
export async function recordPageView(page) {
  try {
    const token = getAuthToken();

    // Only record if user is authenticated
    if (!token) {
      return null;
    }

    const res = await fetch(`${API_URL}/pageview`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({ page }),
    });

    if (!res.ok) {
      throw new Error('Failed to record page view');
    }

    return await res.json();
  } catch (error) {
    console.error('Failed to record page view:', error);
    return null;
  }
}

// Get artist demographics
export async function getArtistDemographics(artistId) {
  try {
    const res = await fetch(`${API_URL}/demographics/artist/${artistId}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch demographics');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load demographics');
  }
}

// Get song demographics
export async function getSongDemographics(songId) {
  try {
    const res = await fetch(`${API_URL}/demographics/song/${songId}`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch song demographics');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load song demographics');
  }
}

// Get location distribution
export async function getLocationDistribution(artistId) {
  try {
    const res = await fetch(`${API_URL}/demographics/artist/${artistId}/locations`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch location data');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load location data');
  }
}

// Get age distribution
export async function getAgeDistribution(artistId) {
  try {
    const res = await fetch(`${API_URL}/demographics/artist/${artistId}/age-groups`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch age data');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load age data');
  }
}

// Get gender distribution
export async function getGenderDistribution(artistId) {
  try {
    const res = await fetch(`${API_URL}/demographics/artist/${artistId}/gender`, {
      headers: createHeaders(true),
    });

    if (!res.ok) {
      throw new Error('Failed to fetch gender data');
    }

    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load gender data');
  }
}

// Record listen history (used for Recently Played)
export async function recordListenHistory({ userId, songId, artistId } = {}) {
  try {
    const token = getAuthToken();
    if (!token) return null;

    if (!userId || !songId) return null;

    const params = new URLSearchParams({
      userId: String(userId),
      songId: String(songId),
    });
    if (artistId) {
      params.set("artistId", String(artistId));
    }

    const res = await fetch(`${API_URL}/listen-history?${params.toString()}`, {
      method: "POST",
      headers: createHeaders(true),
    });

    if (!res.ok) {
      // Non-critical; don't break playback UX
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to record listen history:", error);
    return null;
  }
}

// Record search history (used for analytics/search stats)
export async function recordSearchHistory({ userId, query } = {}) {
  try {
    const token = getAuthToken();
    if (!token) return null;

    const normalizedQuery = String(query ?? "").trim();
    if (!userId || !normalizedQuery) return null;

    const params = new URLSearchParams({
      userId: String(userId),
      query: normalizedQuery,
    });

    const res = await fetch(`${API_URL}/search-history?${params.toString()}`, {
      method: "POST",
      headers: createHeaders(true),
    });

    if (!res.ok) {
      // Non-critical; don't break search UX
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("Failed to record search history:", error);
    return null;
  }
}

// =============================
// User history (listen/search)
// =============================

export async function getUserListenHistory(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_URL}/listen-history/user/${encodeURIComponent(String(userId))}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch listen history");
  return await res.json();
}

export async function getUserSearchHistory(userId) {
  if (!userId) throw new Error("Missing userId");
  const res = await fetch(`${API_URL}/search-history/user/${encodeURIComponent(String(userId))}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch search history");
  return await res.json();
}

// =============================
// Admin metrics (requires ADMIN)
// =============================

export async function getAdminTopSongPlays({ from, to, limit = 20 } = {}) {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const res = await fetch(`${API_URL}/admin/metrics/songs/plays/top?${params.toString()}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch admin top songs");
  return await res.json();
}

export async function getAdminTopArtistPlays({ from, to, limit = 20 } = {}) {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const res = await fetch(`${API_URL}/admin/metrics/artists/plays/top?${params.toString()}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch admin top artists");
  return await res.json();
}

export async function getAdminTopUserListens({ from, to, limit = 20 } = {}) {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const res = await fetch(`${API_URL}/admin/metrics/users/listens/top?${params.toString()}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch admin top users");
  return await res.json();
}

export async function getAdminTopSearches({ from, to, limit = 20 } = {}) {
  const params = new URLSearchParams({ from, to, limit: String(limit) });
  const res = await fetch(`${API_URL}/admin/metrics/searches/top?${params.toString()}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch admin top searches");
  return await res.json();
}

export async function getAdminJobState() {
  const res = await fetch(`${API_URL}/admin/metrics/job-state`, {
    headers: createHeaders(true),
  });
  if (!res.ok) throw new Error("Failed to fetch admin job state");
  return await res.json();
}

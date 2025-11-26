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

// Get trending songs (public)
export async function getTrendingSongs(limit = 20) {
  try {
    const res = await fetch(`${API_URL}/trending?limit=${limit}`);
    
    if (!res.ok) {
      throw new Error('Failed to fetch trending songs');
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || 'Failed to load trending songs');
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

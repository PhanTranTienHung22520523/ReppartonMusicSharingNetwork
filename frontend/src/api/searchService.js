import { API_ENDPOINTS, createHeaders } from '../config/api.config';

function getCurrentUserId() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.id ? String(parsed.id) : null;
  } catch {
    return null;
  }
}

function unwrapToArray(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;

  // Common API wrappers
  if (Array.isArray(value.data)) return value.data;
  if (Array.isArray(value.content)) return value.content;

  // Nested wrappers (defensive)
  if (value.data && Array.isArray(value.data.data)) return value.data.data;

  // Errors or unknown shapes
  return [];
}

function headersForGet(includeAuth = false) {
  const headers = createHeaders(includeAuth);
  // Avoid Content-Type on GET to prevent unnecessary preflight requests
  delete headers['Content-Type'];
  return headers;
}

// Global search - searches across songs, users, playlists, and posts using centralized search-service
export async function globalSearch(query, page = 0, size = 10) {
  try {
    const url = new URL(API_ENDPOINTS.search);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const userId = getCurrentUserId();
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const res = await fetch(url, {
      headers: headersForGet(false),
    });
    
    if (!res.ok) {
      throw new Error("Global search failed");
    }
    
    const results = await res.json();
    
    // Extract data from each service result
    return {
      songs: unwrapToArray(results.songs),
      users: unwrapToArray(results.users),
      playlists: unwrapToArray(results.playlists),
      posts: unwrapToArray(results.posts),
      lyrics: unwrapToArray(results.lyrics),
    };
  } catch (error) {
    console.error("Global search error:", error);
    throw new Error(error.message || "Search failed");
  }
}

// Search only songs
export async function searchSongs(query, page = 0, size = 20) {
  try {
    const url = new URL(`${API_ENDPOINTS.search}/songs`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const userId = getCurrentUserId();
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const res = await fetch(url, {
      headers: headersForGet(false),
    });
    
    if (!res.ok) {
      throw new Error("Song search failed");
    }
    
    const response = await res.json();
    return unwrapToArray(response);
  } catch (error) {
    console.error("Search songs error:", error);
    throw new Error(error.message || "Network error");
  }
}

// Search only users
export async function searchUsers(query, page = 0, size = 20) {
  try {
    const url = new URL(`${API_ENDPOINTS.search}/users`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const userId = getCurrentUserId();
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const res = await fetch(url, {
      headers: headersForGet(false),
    });
    
    if (!res.ok) {
      throw new Error("User search failed");
    }
    
    const response = await res.json();
    return unwrapToArray(response);
  } catch (error) {
    console.error("Search users error:", error);
    throw new Error(error.message || "Network error");
  }
}

// Search only playlists
export async function searchPlaylists(query, page = 0, size = 20) {
  try {
    const url = new URL(`${API_ENDPOINTS.search}/playlists`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const userId = getCurrentUserId();
    if (userId) {
      url.searchParams.append('userId', userId);
    }

    const res = await fetch(url, {
      headers: headersForGet(false),
    });
    
    if (!res.ok) {
      throw new Error("Playlist search failed");
    }
    
    const response = await res.json();
    return unwrapToArray(response);
  } catch (error) {
    console.error("Search playlists error:", error);
    throw new Error(error.message || "Network error");
  }
}

// Get search suggestions (quick search)
export async function getSearchSuggestions(query) {
  try {
    const url = new URL(`${API_ENDPOINTS.search}/quick`);
    url.searchParams.append('query', query);
    url.searchParams.append('limit', '5');

    const res = await fetch(url, {
      headers: headersForGet(false),
    });

    if (!res.ok) {
      return [];
    }

    const quick = await res.json();
    const songs = unwrapToArray(quick.songs);
    const users = unwrapToArray(quick.users);

    const suggestions = [];

    songs.forEach((song) => {
      suggestions.push({
        id: song.id,
        type: 'song',
        title: song.title,
        subtitle: song.artistUsername || 'Unknown Artist'
      });
    });

    users.forEach((user) => {
      suggestions.push({
        id: user.id,
        type: 'user',
        title: user.fullName || user.username,
        subtitle: '@' + user.username
      });
    });

    return suggestions;
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
}

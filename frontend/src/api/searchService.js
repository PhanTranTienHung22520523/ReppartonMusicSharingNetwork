const API_URL = `${import.meta.env.VITE_API_BASE_URL}/search`;

// Get auth token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).token : null;
};

// Create headers with auth token
const createHeaders = (includeAuth = true) => {
  const headers = { "Content-Type": "application/json" };
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  return headers;
};

// Global search - returns songs, users, and playlists
export async function globalSearch(query, page = 0, size = 10) {
  try {
    const url = new URL(`${API_URL}`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const res = await fetch(url, {
      headers: createHeaders(false), // Don't require auth for search
    });
    
    if (!res.ok) {
      throw new Error("Search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Search only songs
export async function searchSongs(query, page = 0, size = 10) {
  try {
    const url = new URL(`${API_URL}/songs`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const res = await fetch(url, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Song search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Search only users
export async function searchUsers(query, page = 0, size = 10) {
  try {
    const url = new URL(`${API_URL}/users`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const res = await fetch(url, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("User search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Search only playlists
export async function searchPlaylists(query, page = 0, size = 10) {
  try {
    const url = new URL(`${API_URL}/playlists`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('size', size.toString());

    const res = await fetch(url, {
      headers: createHeaders(false),
    });
    
    if (!res.ok) {
      throw new Error("Playlist search failed");
    }
    
    return await res.json();
  } catch (error) {
    throw new Error(error.message || "Network error");
  }
}

// Get search suggestions (quick search)
export async function getSearchSuggestions(query) {
  try {
    // Use global search endpoint for suggestions
    const searchResults = await globalSearch(query, 0, 5); // Limit to 5 results for suggestions
    
    // Transform the results to match the expected format
    const suggestions = [];
    
    // Add song suggestions
    if (searchResults.songs && searchResults.songs.length > 0) {
      searchResults.songs.forEach(song => {
        suggestions.push({
          id: song.id,
          type: 'song',
          title: song.title,
          subtitle: song.artistUsername || 'Unknown Artist'
        });
      });
    }
    
    // Add user suggestions
    if (searchResults.users && searchResults.users.length > 0) {
      searchResults.users.forEach(user => {
        suggestions.push({
          id: user.id,
          type: 'user',
          title: user.fullName || user.username,
          subtitle: '@' + user.username
        });
      });
    }
    
    // Add playlist suggestions
    if (searchResults.playlists && searchResults.playlists.length > 0) {
      searchResults.playlists.forEach(playlist => {
        suggestions.push({
          id: playlist.id,
          type: 'playlist',
          title: playlist.name,
          subtitle: `${playlist.songCount || 0} songs`
        });
      });
    }
    
    return suggestions;
  } catch (error) {
    console.error("Error getting search suggestions:", error);
    return [];
  }
}

import axios from 'axios';
import { API_ENDPOINTS, getAuthToken } from '../config/api.config';

const AI_BASE_URL = API_ENDPOINTS.ai;
const SONGS_BASE_URL = API_ENDPOINTS.songs;

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * AI Service Client
 * Handles communication with Python Flask AI Service
 */

// Health check
export const checkAIHealth = async () => {
  try {
    const response = await axios.get('http://localhost:5000/health');
    return response.data;
  } catch (error) {
    console.error('AI Service health check failed:', error);
    throw error;
  }
};

// Music Analysis
export const analyzeSong = async (songId) => {
  try {
    // Trigger analysis in song-service (it calls the Python AI service internally)
    // Include user id header when available (song-service requires X-User-Id)
    let userId = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        userId = u?.id || u?.userId || null;
      }
    } catch (e) {
      // ignore
    }

    const headers = {};
    if (userId) headers['X-User-Id'] = String(userId);
    const authToken = getAuthToken();
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await axios.post(`${SONGS_BASE_URL}/${songId}/analyze`, {}, { headers });
    return response.data;
  } catch (error) {
    console.error('Song analysis failed:', error);
    throw error;
  }
};

// Trigger chord analysis
export const analyzeChords = async (songId, dominantOnly = false) => {
  try {
    const url = `${SONGS_BASE_URL}/${songId}/analyze-chords${dominantOnly ? '?dominantOnly=true' : ''}`;
    // include user id header when available (song-service may require it)
    let userId = null;
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw);
        userId = u?.id || u?.userId || null;
      }
    } catch (e) { }

    const headers = {};
    if (userId) headers['X-User-Id'] = String(userId);
    const authToken = getAuthToken();
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const response = await axios.post(url, {}, { headers });
    return response.data;
  } catch (error) {
    console.error('Chord analysis failed:', error);
    throw error;
  }
};

// (Optional) Direct analysis against the Python AI service
export const analyzeAudioDirect = async (audioFileOrUrl) => {
  try {
    const formData = new FormData();

    if (typeof audioFileOrUrl === 'string') {
      formData.append('audio_url', audioFileOrUrl);
    } else {
      formData.append('file', audioFileOrUrl);
    }

    const response = await axios.post(`${AI_BASE_URL}/music/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Direct song analysis failed:', error);
    throw error;
  }
};

// Extract audio features for ML
export const extractFeatures = async (audioFileOrUrl) => {
  try {
    const formData = new FormData();

    if (typeof audioFileOrUrl === 'string') {
      formData.append('audio_url', audioFileOrUrl);
    } else {
      formData.append('file', audioFileOrUrl);
    }

    const response = await axios.post(`${AI_BASE_URL}/music/extract-features`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Feature extraction failed:', error);
    throw error;
  }
};

// Recommendations
export const getRecommendationsBySong = async (songId, audioFeatures, limit = 10) => {
  try {
    const response = await axios.post(`${AI_BASE_URL}/recommend/by-song`, {
      song_id: songId,
      audio_features: audioFeatures,
      limit
    });

    return response.data;
  } catch (error) {
    console.error('Recommendation by song failed:', error);
    throw error;
  }
};

export const getRecommendationsByUser = async (userId, listeningHistory, limit = 10) => {
  try {
    const response = await axios.post(`${AI_BASE_URL}/recommend/by-user`, {
      user_id: userId,
      listening_history: listeningHistory,
      limit
    });

    return response.data;
  } catch (error) {
    console.error('Recommendation by user failed:', error);
    throw error;
  }
};

export const trainRecommendationModel = async (interactions) => {
  try {
    const response = await axios.post(`${AI_BASE_URL}/recommend/train`, {
      interactions
    });

    return response.data;
  } catch (error) {
    console.error('Model training failed:', error);
    throw error;
  }
};

// Artist Verification
export const verifyArtist = async (applicationData) => {
  try {
    const response = await axios.post(`${AI_BASE_URL}/artist/verify`, applicationData);
    return response.data;
  } catch (error) {
    console.error('Artist verification failed:', error);
    throw error;
  }
};

export const verifyDocument = async (documentFile, expectedName) => {
  try {
    const formData = new FormData();
    formData.append('file', documentFile);
    formData.append('expected_name', expectedName);

    const response = await axios.post(`${AI_BASE_URL}/artist/verify-document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Document verification failed:', error);
    throw error;
  }
};

export const verifySocialMedia = async (socialMediaLinks) => {
  try {
    const response = await axios.post(`${AI_BASE_URL}/artist/verify-social-media`, {
      social_media: socialMediaLinks
    });

    return response.data;
  } catch (error) {
    console.error('Social media verification failed:', error);
    throw error;
  }
};

// Song filtering by AI analysis
export const getSongsByKey = async (key) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/by-key/${encodeURIComponent(key)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get songs by key:', error);
    throw error;
  }
};

export const getSongsByMood = async (mood) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/by-mood/${encodeURIComponent(mood)}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get songs by mood:', error);
    throw error;
  }
};

export const getSongsByTempo = async (minTempo, maxTempo) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/by-tempo`, {
      params: { minBpm: minTempo, maxBpm: maxTempo }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get songs by tempo:', error);
    throw error;
  }
};

// Get AI analysis for a song
export const getAIAnalysis = async (songId) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/${songId}/analysis`, {
      // Public: no auth header to allow read access to analysis
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get AI analysis:', error);
    throw error;
  }
};

// Recommendation service (Gateway -> recommendation-service)
export const getRecommendationsServicePersonalized = async (userId, limit = 20) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.recommendations}/personalized/${encodeURIComponent(userId)}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get personalized recommendations:', error);
    throw error;
  }
};

export const getRecommendationsServiceTrending = async (limit = 20) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.recommendations}/trending?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get trending recommendations:', error);
    throw error;
  }
};

export const getRecommendationsServiceSimilar = async (songId, limit = 10) => {
  try {
    const response = await axios.get(`${API_ENDPOINTS.recommendations}/similar/${encodeURIComponent(songId)}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get similar recommendations:', error);
    throw error;
  }
};

// Get chord analysis for a song
export const getChordAnalysis = async (songId) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/${songId}/chords`, {
      // Public: no auth header for chord read
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get chord analysis:', error);
    throw error;
  }
};

// Lyrics management
export const getLyrics = async (songId) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/${songId}/lyrics`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get lyrics:', error);
    throw error;
  }
};

export const getSyncedLyrics = async (songId) => {
  try {
    const response = await axios.get(`${SONGS_BASE_URL}/${songId}/lyrics/synced`, {
      headers: {
        ...getAuthHeaders()
      }
    });
    return response.data;
  } catch (error) {
    console.error('Failed to get synced lyrics:', error);
    throw error;
  }
};

export const updateLyrics = async (songId, lyrics) => {
  try {
    const response = await axios.put(
      `${SONGS_BASE_URL}/${songId}/lyrics`,
      lyrics,
      {
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'text/plain'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to update lyrics:', error);
    throw error;
  }
};

export const extractLyrics = async (songId) => {
  try {
    const response = await axios.post(
      `${SONGS_BASE_URL}/${songId}/lyrics/extract`,
      {},
      {
        headers: {
          ...getAuthHeaders()
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to extract lyrics:', error);
    throw error;
  }
};

export const syncLyrics = async (songId) => {
  try {
    const response = await axios.post(
      `${SONGS_BASE_URL}/${songId}/lyrics/sync`,
      {},
      {
        headers: {
          ...getAuthHeaders()
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Failed to sync lyrics:', error);
    throw error;
  }
};

export default {
  checkAIHealth,
  analyzeSong,
  analyzeChords,
  analyzeAudioDirect,
  extractFeatures,
  getRecommendationsBySong,
  getRecommendationsByUser,
  trainRecommendationModel,
  verifyArtist,
  verifyDocument,
  verifySocialMedia,
  getSongsByKey,
  getSongsByMood,
  getSongsByTempo,
  getAIAnalysis,
  getChordAnalysis,
  getLyrics,
  getSyncedLyrics,
  updateLyrics,
  extractLyrics,
  syncLyrics
};

import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const AI_BASE_URL = API_ENDPOINTS.ai;

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
export const analyzeSong = async (audioFileOrUrl) => {
  try {
    const formData = new FormData();
    
    if (typeof audioFileOrUrl === 'string') {
      // URL provided
      formData.append('audio_url', audioFileOrUrl);
    } else {
      // File provided
      formData.append('file', audioFileOrUrl);
    }
    
    const response = await axios.post(`${AI_BASE_URL}/music/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Song analysis failed:', error);
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

export default {
  checkAIHealth,
  analyzeSong,
  extractFeatures,
  getRecommendationsBySong,
  getRecommendationsByUser,
  trainRecommendationModel,
  verifyArtist,
  verifyDocument,
  verifySocialMedia
};

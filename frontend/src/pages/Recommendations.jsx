import React, { useState, useEffect } from 'react';
import { getRecommendationsByUser, checkAIHealth } from '../api/aiService';
import songService from '../api/songService';
import SongCard from '../components/SongCard';
import { useAuth } from '../contexts/AuthContext';
import './Recommendations.css';

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiServiceAvailable, setAiServiceAvailable] = useState(false);
  const [songs, setSongs] = useState([]);

  // Check AI Service availability
  useEffect(() => {
    const checkService = async () => {
      try {
        const health = await checkAIHealth();
        setAiServiceAvailable(health.status === 'healthy');
      } catch (err) {
        console.warn('AI Service not available, using fallback recommendations');
        setAiServiceAvailable(false);
      }
    };
    
    checkService();
  }, []);

  // Load recommendations
  useEffect(() => {
    const loadRecommendations = async () => {
      if (!user) {
        setError('Please login to get personalized recommendations');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (aiServiceAvailable) {
          // Get AI-powered recommendations
          const history = await getListeningHistory();
          const result = await getRecommendationsByUser(user.id, history, 20);
          
          if (result.recommendations && result.recommendations.length > 0) {
            // Fetch full song details for recommended song IDs
            const songIds = result.recommendations.map(r => r.song_id);
            const songDetails = await Promise.all(
              songIds.map(id => songService.getSongById(id).catch(() => null))
            );
            
            const validSongs = songDetails.filter(s => s !== null);
            setSongs(validSongs);
            setRecommendations(result.recommendations);
          } else {
            // Fallback to popular songs
            await loadPopularSongs();
          }
        } else {
          // AI Service not available, use fallback
          await loadPopularSongs();
        }
      } catch (err) {
        console.error('Failed to load recommendations:', err);
        setError('Failed to load recommendations');
        // Try fallback
        await loadPopularSongs();
      } finally {
        setLoading(false);
      }
    };

    loadRecommendations();
  }, [user, aiServiceAvailable]);

  // Get user's listening history
  const getListeningHistory = async () => {
    try {
      const history = await songService.getListeningHistory(user.id);
      return history.map(h => ({
        song_id: h.songId,
        play_count: h.playCount,
        last_played: h.lastPlayed,
        liked: h.liked || false
      }));
    } catch (err) {
      console.error('Failed to get listening history:', err);
      return [];
    }
  };

  // Fallback: Load popular songs
  const loadPopularSongs = async () => {
    try {
      const popular = await songService.getPopularSongs(20);
      setSongs(popular);
      setRecommendations(popular.map((s, i) => ({
        song_id: s.id,
        similarity_score: 1 - (i * 0.05), // Mock scores
        reason: 'Popular song'
      })));
    } catch (err) {
      console.error('Failed to load popular songs:', err);
      setError('Failed to load songs');
    }
  };

  if (loading) {
    return (
      <div className="recommendations-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading AI-powered recommendations...</p>
        </div>
      </div>
    );
  }

  if (error && songs.length === 0) {
    return (
      <div className="recommendations-page">
        <div className="error-container">
          <h3>😔 {error}</h3>
          <button onClick={() => window.location.reload()}>Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="recommendations-page">
      <div className="recommendations-header">
        <h1>🎵 Recommended For You</h1>
        {aiServiceAvailable ? (
          <p className="ai-badge">✨ AI-Powered Recommendations</p>
        ) : (
          <p className="fallback-badge">⭐ Popular Songs</p>
        )}
      </div>

      {!user && (
        <div className="login-prompt">
          <p>Login to get personalized AI recommendations based on your listening history!</p>
          <button onClick={() => window.location.href = '/login'}>Login Now</button>
        </div>
      )}

      <div className="recommendations-grid">
        {songs.map((song, index) => {
          const rec = recommendations.find(r => r.song_id === song.id) || {};
          return (
            <div key={song.id} className="recommendation-item">
              <SongCard song={song} />
              {aiServiceAvailable && rec.similarity_score && (
                <div className="recommendation-info">
                  <div className="similarity-score">
                    Match: {(rec.similarity_score * 100).toFixed(0)}%
                  </div>
                  {rec.reason && (
                    <div className="recommendation-reason">{rec.reason}</div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {songs.length === 0 && (
        <div className="empty-state">
          <h3>No recommendations available</h3>
          <p>Start listening to songs to get personalized recommendations!</p>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

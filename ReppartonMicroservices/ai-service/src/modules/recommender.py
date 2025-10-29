"""
Song Recommender Module
Provides music recommendations using content-based and collaborative filtering
"""

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
from typing import Dict, List, Any, Optional
import logging
import pickle
import os
from collections import defaultdict

logger = logging.getLogger(__name__)


class SongRecommender:
    """
    Hybrid recommendation system combining:
    1. Content-based filtering (audio features)
    2. Collaborative filtering (user behavior)
    3. Popularity-based ranking
    """
    
    def __init__(self):
        """Initialize the recommender"""
        self.song_database = {}  # {song_id: features}
        self.user_interactions = defaultdict(dict)  # {user_id: {song_id: score}}
        self.scaler = StandardScaler()
        self.is_trained = False
        
        logger.info("SongRecommender initialized")
        
        # Try to load pre-trained model
        self._load_model()
    
    def recommend_by_features(self, audio_features: Dict[str, Any], 
                             limit: int = 10,
                             exclude_ids: List[str] = None) -> List[Dict[str, Any]]:
        """
        Recommend songs based on audio feature similarity
        
        Args:
            audio_features: Audio features from music analyzer
            limit: Number of recommendations
            exclude_ids: Song IDs to exclude from recommendations
            
        Returns:
            List of recommended songs with similarity scores
        """
        try:
            if not self.song_database:
                logger.warning("Song database is empty. Using mock recommendations.")
                return self._generate_mock_recommendations(limit)
            
            # Extract feature vector
            query_vector = self._extract_feature_vector(audio_features)
            
            # Calculate similarity with all songs
            similarities = []
            
            for song_id, song_data in self.song_database.items():
                # Skip excluded songs
                if exclude_ids and song_id in exclude_ids:
                    continue
                
                song_vector = self._extract_feature_vector(song_data['features'])
                similarity = self._calculate_similarity(query_vector, song_vector)
                
                similarities.append({
                    'song_id': song_id,
                    'similarity_score': float(similarity),
                    'reason': self._generate_reason(audio_features, song_data['features'])
                })
            
            # Sort by similarity
            similarities.sort(key=lambda x: x['similarity_score'], reverse=True)
            
            return similarities[:limit]
            
        except Exception as e:
            logger.error(f"Error in recommend_by_features: {str(e)}")
            return self._generate_mock_recommendations(limit)
    
    def recommend_by_user(self, user_id: str, 
                         listening_history: List[Dict[str, Any]],
                         limit: int = 20) -> List[Dict[str, Any]]:
        """
        Recommend songs based on user's listening history
        Uses collaborative filtering and user preferences
        
        Args:
            user_id: User identifier
            listening_history: List of {song_id, play_count, liked}
            limit: Number of recommendations
            
        Returns:
            List of recommended songs
        """
        try:
            if not self.song_database:
                logger.warning("Song database is empty. Using mock recommendations.")
                return self._generate_mock_recommendations(limit)
            
            # Update user interactions
            for item in listening_history:
                song_id = item.get('song_id')
                play_count = item.get('play_count', 1)
                liked = item.get('liked', False)
                
                # Calculate interaction score
                score = play_count * (2 if liked else 1)
                self.user_interactions[user_id][song_id] = score
            
            # Get user's favorite songs
            user_songs = self.user_interactions[user_id]
            
            if not user_songs:
                # New user - return popular songs
                return self._recommend_popular(limit)
            
            # Calculate weighted average of user's favorite song features
            user_profile = self._build_user_profile(user_songs)
            
            # Find similar songs
            recommendations = []
            listened_song_ids = set(user_songs.keys())
            
            for song_id, song_data in self.song_database.items():
                if song_id in listened_song_ids:
                    continue
                
                song_vector = self._extract_feature_vector(song_data['features'])
                similarity = self._calculate_similarity(user_profile, song_vector)
                
                # Apply collaborative filtering boost
                cf_score = self._collaborative_filtering_score(user_id, song_id)
                
                # Combine content and collaborative scores
                final_score = similarity * 0.7 + cf_score * 0.3
                
                recommendations.append({
                    'song_id': song_id,
                    'score': float(final_score),
                    'content_score': float(similarity),
                    'collaborative_score': float(cf_score),
                    'reason': 'Based on your listening history'
                })
            
            # Sort by final score
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            
            return recommendations[:limit]
            
        except Exception as e:
            logger.error(f"Error in recommend_by_user: {str(e)}")
            return self._generate_mock_recommendations(limit)
    
    def train(self, songs: List[Dict[str, Any]], 
             interactions: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Train the recommendation model with new data
        
        Args:
            songs: List of songs with features
                   [{song_id, features: {tempo, key, energy, ...}}]
            interactions: List of user-song interactions
                         [{user_id, song_id, play_count, liked, timestamp}]
            
        Returns:
            Training metrics
        """
        try:
            logger.info(f"Training recommender with {len(songs)} songs and {len(interactions)} interactions")
            
            # Build song database
            for song in songs:
                song_id = song.get('song_id')
                features = song.get('features', {})
                
                self.song_database[song_id] = {
                    'features': features,
                    'popularity': 0
                }
            
            # Process interactions
            for interaction in interactions:
                user_id = interaction.get('user_id')
                song_id = interaction.get('song_id')
                play_count = interaction.get('play_count', 1)
                liked = interaction.get('liked', False)
                
                # Update user interactions
                score = play_count * (2 if liked else 1)
                self.user_interactions[user_id][song_id] = score
                
                # Update song popularity
                if song_id in self.song_database:
                    self.song_database[song_id]['popularity'] += score
            
            # Fit scaler on all song features
            all_vectors = []
            for song_data in self.song_database.values():
                vector = self._extract_feature_vector(song_data['features'])
                all_vectors.append(vector)
            
            if all_vectors:
                self.scaler.fit(all_vectors)
            
            self.is_trained = True
            
            # Save model
            self._save_model()
            
            metrics = {
                'total_songs': len(self.song_database),
                'total_users': len(self.user_interactions),
                'total_interactions': len(interactions),
                'status': 'trained'
            }
            
            logger.info(f"Training complete: {metrics}")
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error training model: {str(e)}")
            raise
    
    def _extract_feature_vector(self, features: Dict[str, Any]) -> np.ndarray:
        """
        Convert feature dictionary to numpy vector
        """
        # Extract numeric features
        vector = [
            features.get('tempo', 120.0) / 200.0,  # Normalize
            features.get('energy', 0.5),
            features.get('danceability', 0.5),
            features.get('valence', 0.5),
            features.get('acousticness', 0.5),
            features.get('instrumentalness', 0.5),
            features.get('loudness', -20.0) / -60.0,  # Normalize dB
            features.get('spectral_centroid', 2000.0) / 4000.0,
            features.get('zero_crossing_rate', 0.1),
        ]
        
        # Add key as one-hot encoding
        key = features.get('key', 'C major')
        key_features = self._encode_key(key)
        vector.extend(key_features)
        
        # Add mood as one-hot encoding
        mood = features.get('mood', 'neutral')
        mood_features = self._encode_mood(mood)
        vector.extend(mood_features)
        
        return np.array(vector)
    
    def _encode_key(self, key: str) -> List[float]:
        """
        One-hot encode musical key
        """
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        scales = ['major', 'minor']
        
        # Parse key
        parts = key.split()
        note = parts[0] if parts else 'C'
        scale = parts[1] if len(parts) > 1 else 'major'
        
        # One-hot encode
        key_vector = [1.0 if k == note else 0.0 for k in keys]
        scale_vector = [1.0 if s == scale else 0.0 for s in scales]
        
        return key_vector + scale_vector
    
    def _encode_mood(self, mood: str) -> List[float]:
        """
        One-hot encode mood
        """
        moods = ['happy', 'sad', 'energetic', 'calm', 'angry', 'peaceful', 'neutral']
        return [1.0 if m == mood else 0.0 for m in moods]
    
    def _calculate_similarity(self, vec1: np.ndarray, vec2: np.ndarray) -> float:
        """
        Calculate cosine similarity between two feature vectors
        """
        try:
            vec1 = vec1.reshape(1, -1)
            vec2 = vec2.reshape(1, -1)
            
            similarity = cosine_similarity(vec1, vec2)[0][0]
            return max(0.0, min(1.0, similarity))  # Clamp to [0, 1]
            
        except Exception as e:
            logger.warning(f"Error calculating similarity: {str(e)}")
            return 0.5
    
    def _build_user_profile(self, user_songs: Dict[str, float]) -> np.ndarray:
        """
        Build user profile as weighted average of their favorite songs
        """
        weighted_features = None
        total_weight = 0
        
        for song_id, score in user_songs.items():
            if song_id not in self.song_database:
                continue
            
            song_vector = self._extract_feature_vector(self.song_database[song_id]['features'])
            
            if weighted_features is None:
                weighted_features = song_vector * score
            else:
                weighted_features += song_vector * score
            
            total_weight += score
        
        if total_weight > 0 and weighted_features is not None:
            return weighted_features / total_weight
        else:
            # Default profile
            return np.zeros(self._extract_feature_vector({}).shape)
    
    def _collaborative_filtering_score(self, user_id: str, song_id: str) -> float:
        """
        Calculate collaborative filtering score
        Find similar users and see if they liked this song
        """
        try:
            if user_id not in self.user_interactions:
                return 0.0
            
            user_songs = self.user_interactions[user_id]
            
            # Find similar users (users who liked same songs)
            similar_users = []
            
            for other_user_id, other_songs in self.user_interactions.items():
                if other_user_id == user_id:
                    continue
                
                # Calculate user similarity (Jaccard similarity)
                common_songs = set(user_songs.keys()) & set(other_songs.keys())
                all_songs = set(user_songs.keys()) | set(other_songs.keys())
                
                if len(all_songs) > 0:
                    similarity = len(common_songs) / len(all_songs)
                    similar_users.append((other_user_id, similarity))
            
            # Sort by similarity
            similar_users.sort(key=lambda x: x[1], reverse=True)
            
            # Check if similar users liked this song
            score = 0.0
            total_weight = 0.0
            
            for other_user_id, similarity in similar_users[:10]:  # Top 10 similar users
                if song_id in self.user_interactions[other_user_id]:
                    score += similarity * self.user_interactions[other_user_id][song_id]
                    total_weight += similarity
            
            if total_weight > 0:
                return min(score / total_weight / 10.0, 1.0)  # Normalize
            else:
                return 0.0
                
        except Exception as e:
            logger.warning(f"Error in collaborative filtering: {str(e)}")
            return 0.0
    
    def _recommend_popular(self, limit: int) -> List[Dict[str, Any]]:
        """
        Recommend popular songs (for new users)
        """
        popular_songs = []
        
        for song_id, song_data in self.song_database.items():
            popular_songs.append({
                'song_id': song_id,
                'score': song_data.get('popularity', 0),
                'reason': 'Popular song'
            })
        
        popular_songs.sort(key=lambda x: x['score'], reverse=True)
        
        return popular_songs[:limit]
    
    def _generate_reason(self, features1: Dict, features2: Dict) -> str:
        """
        Generate human-readable reason for recommendation
        """
        reasons = []
        
        # Compare tempo
        tempo_diff = abs(features1.get('tempo', 120) - features2.get('tempo', 120))
        if tempo_diff < 10:
            reasons.append("similar tempo")
        
        # Compare mood
        if features1.get('mood') == features2.get('mood'):
            reasons.append(f"same {features1.get('mood')} mood")
        
        # Compare key
        if features1.get('key') == features2.get('key'):
            reasons.append(f"same key ({features1.get('key')})")
        
        # Compare energy
        energy_diff = abs(features1.get('energy', 0.5) - features2.get('energy', 0.5))
        if energy_diff < 0.2:
            reasons.append("similar energy level")
        
        if reasons:
            return "Similar: " + ", ".join(reasons)
        else:
            return "Based on audio features"
    
    def _generate_mock_recommendations(self, limit: int) -> List[Dict[str, Any]]:
        """
        Generate mock recommendations when database is empty
        """
        logger.info("Generating mock recommendations")
        
        return [
            {
                'song_id': f'mock_song_{i}',
                'similarity_score': 0.9 - (i * 0.05),
                'reason': 'Mock recommendation (database not loaded)'
            }
            for i in range(limit)
        ]
    
    def _save_model(self):
        """
        Save trained model to disk
        """
        try:
            model_dir = os.path.join(os.path.dirname(__file__), '..', 'models')
            os.makedirs(model_dir, exist_ok=True)
            
            model_path = os.path.join(model_dir, 'recommender_model.pkl')
            
            model_data = {
                'song_database': self.song_database,
                'user_interactions': dict(self.user_interactions),
                'scaler': self.scaler,
                'is_trained': self.is_trained
            }
            
            with open(model_path, 'wb') as f:
                pickle.dump(model_data, f)
            
            logger.info(f"Model saved to {model_path}")
            
        except Exception as e:
            logger.warning(f"Error saving model: {str(e)}")
    
    def _load_model(self):
        """
        Load pre-trained model from disk
        """
        try:
            model_path = os.path.join(os.path.dirname(__file__), '..', 'models', 'recommender_model.pkl')
            
            if os.path.exists(model_path):
                with open(model_path, 'rb') as f:
                    model_data = pickle.load(f)
                
                self.song_database = model_data.get('song_database', {})
                self.user_interactions = defaultdict(dict, model_data.get('user_interactions', {}))
                self.scaler = model_data.get('scaler', StandardScaler())
                self.is_trained = model_data.get('is_trained', False)
                
                logger.info(f"Model loaded from {model_path}")
                logger.info(f"Loaded {len(self.song_database)} songs, {len(self.user_interactions)} users")
            else:
                logger.info("No pre-trained model found")
                
        except Exception as e:
            logger.warning(f"Error loading model: {str(e)}")

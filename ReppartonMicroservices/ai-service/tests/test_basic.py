"""
Simple test to verify AI service is working
Run: python -m pytest tests/test_basic.py
"""

import pytest
import sys
import os

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

from modules.music_analyzer import MusicAnalyzer
from modules.recommender import SongRecommender
from modules.artist_verifier import ArtistVerifier


def test_music_analyzer_init():
    """Test MusicAnalyzer initialization"""
    analyzer = MusicAnalyzer()
    assert analyzer is not None
    assert analyzer.sr == 22050


def test_song_recommender_init():
    """Test SongRecommender initialization"""
    recommender = SongRecommender()
    assert recommender is not None
    assert recommender.song_database is not None


def test_artist_verifier_init():
    """Test ArtistVerifier initialization"""
    verifier = ArtistVerifier()
    assert verifier is not None
    assert verifier.confidence_thresholds['auto_approve'] == 0.7
    assert verifier.confidence_thresholds['manual_review'] == 0.4


def test_recommender_feature_extraction():
    """Test feature vector extraction"""
    recommender = SongRecommender()
    
    features = {
        'tempo': 120.0,
        'energy': 0.8,
        'danceability': 0.7,
        'valence': 0.9,
        'key': 'C major',
        'mood': 'happy'
    }
    
    vector = recommender._extract_feature_vector(features)
    assert vector is not None
    assert len(vector) > 0


def test_artist_verifier_confidence_calculation():
    """Test confidence score calculation"""
    verifier = ArtistVerifier()
    
    score = verifier.calculate_confidence_score(
        document_score=0.9,
        social_media_score=0.8,
        portfolio_score=0.7
    )
    
    assert 0.0 <= score <= 1.0
    assert score > 0.7  # Should be auto-approve


def test_url_validation():
    """Test URL validation"""
    verifier = ArtistVerifier()
    
    assert verifier._is_valid_url('https://example.com')
    assert verifier._is_valid_url('http://example.com/path')
    assert not verifier._is_valid_url('not a url')
    assert not verifier._is_valid_url('')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])

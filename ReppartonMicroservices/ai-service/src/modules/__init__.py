"""
Init file for modules package
"""

from .music_analyzer import MusicAnalyzer
from .recommender import SongRecommender
from .artist_verifier import ArtistVerifier

__all__ = ['MusicAnalyzer', 'SongRecommender', 'ArtistVerifier']

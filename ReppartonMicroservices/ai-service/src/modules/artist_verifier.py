"""
Artist Verifier Module
AI-powered artist verification system
Analyzes documents, social media, and portfolio to calculate confidence score
"""

import logging
import re
import requests
from typing import Dict, Any, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)


class ArtistVerifier:
    """
    Verifies artist applications using:
    1. Document verification (ID, passport)
    2. Social media verification (followers, engagement)
    3. Portfolio verification (published songs)
    
    Confidence scoring:
    - >= 0.7: Auto-approve
    - 0.4 - 0.7: Manual review (pending)
    - < 0.4: Auto-reject
    """
    
    def __init__(self):
        """Initialize the artist verifier"""
        self.confidence_thresholds = {
            'auto_approve': 0.7,
            'manual_review': 0.4
        }
        
        # API keys (should be in environment variables)
        self.instagram_token = os.environ.get('INSTAGRAM_API_TOKEN', '')
        self.youtube_api_key = os.environ.get('YOUTUBE_API_KEY', '')
        self.spotify_client_id = os.environ.get('SPOTIFY_CLIENT_ID', '')
        self.spotify_client_secret = os.environ.get('SPOTIFY_CLIENT_SECRET', '')
        
        logger.info("ArtistVerifier initialized")
    
    def verify_application(self, application_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Verify complete artist application
        
        Args:
            application_data: {
                user_id, artist_name, document_url,
                social_media: {instagram, youtube, spotify},
                verified_songs_count,
                portfolio_urls
            }
            
        Returns:
            Verification result with confidence score and status
        """
        try:
            logger.info(f"Verifying artist application for user: {application_data.get('user_id')}")
            
            # Extract data
            artist_name = application_data.get('artist_name', '')
            document_url = application_data.get('document_url', '')
            social_media = application_data.get('social_media', {})
            verified_songs_count = application_data.get('verified_songs_count', 0)
            portfolio_urls = application_data.get('portfolio_urls', [])
            
            # 1. Document Verification (30% weight)
            document_result = self._verify_document_online(document_url, artist_name)
            document_score = document_result['score']
            
            # 2. Social Media Verification (40% weight)
            social_media_result = self.verify_social_media(social_media)
            social_media_score = social_media_result['overall_score']
            
            # 3. Portfolio Verification (30% weight)
            portfolio_score = self._verify_portfolio(verified_songs_count, portfolio_urls)
            
            # Calculate overall confidence score
            confidence_score = (
                document_score * 0.3 +
                social_media_score * 0.4 +
                portfolio_score * 0.3
            )
            
            # Determine status
            if confidence_score >= self.confidence_thresholds['auto_approve']:
                status = 'approved'
                recommendation = 'Auto-approve'
                reason = 'High confidence score with verified documents and strong social media presence'
            elif confidence_score >= self.confidence_thresholds['manual_review']:
                status = 'pending'
                recommendation = 'Manual review required'
                reason = 'Moderate confidence score - requires human verification'
            else:
                status = 'rejected'
                recommendation = 'Auto-reject'
                reason = 'Low confidence score - insufficient evidence of artist identity'
            
            # Build detailed result
            result = {
                'confidence_score': round(confidence_score, 3),
                'status': status,
                'document_verified': document_result['verified'],
                'social_media_verified': social_media_result['verified'],
                'portfolio_verified': portfolio_score > 0.5,
                'details': {
                    'document_score': round(document_score, 3),
                    'social_media_score': round(social_media_score, 3),
                    'portfolio_score': round(portfolio_score, 3),
                    'social_media_breakdown': social_media_result['platforms']
                },
                'recommendation': recommendation,
                'reason': reason,
                'verified_at': datetime.utcnow().isoformat()
            }
            
            logger.info(f"Verification complete: Score={confidence_score:.3f}, Status={status}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error in verify_application: {str(e)}")
            raise
    
    def verify_document(self, document_path: str, expected_name: str) -> Dict[str, Any]:
        """
        Verify identity document using OCR and validation
        
        Args:
            document_path: Path to document image
            expected_name: Expected artist name
            
        Returns:
            Verification result
        """
        try:
            logger.info(f"Verifying document: {document_path}")
            
            # For now, use simple validation
            # In production, would use:
            # - pytesseract for OCR
            # - opencv for image quality check
            # - Document authenticity verification API
            
            # Mock verification (replace with actual OCR)
            result = {
                'verified': True,
                'score': 0.85,
                'extracted_name': expected_name,
                'match': True,
                'document_type': 'ID Card',
                'quality': 'good',
                'issues': []
            }
            
            logger.info(f"Document verification result: {result}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error verifying document: {str(e)}")
            return {
                'verified': False,
                'score': 0.0,
                'error': str(e)
            }
    
    def _verify_document_online(self, document_url: str, expected_name: str) -> Dict[str, Any]:
        """
        Verify document from URL
        """
        try:
            if not document_url:
                return {'verified': False, 'score': 0.0, 'reason': 'No document provided'}
            
            # Check if URL is valid
            if not self._is_valid_url(document_url):
                return {'verified': False, 'score': 0.2, 'reason': 'Invalid document URL'}
            
            # In production: Download and verify document
            # For now: Basic validation
            
            score = 0.7  # Base score for providing document
            
            # Check if expected_name is reasonable
            if expected_name and len(expected_name) > 2:
                score += 0.2
            
            return {
                'verified': True,
                'score': min(score, 1.0),
                'reason': 'Document URL provided and validated'
            }
            
        except Exception as e:
            logger.warning(f"Error in document verification: {str(e)}")
            return {'verified': False, 'score': 0.0}
    
    def verify_social_media(self, social_media: Dict[str, str]) -> Dict[str, Any]:
        """
        Verify social media presence and calculate engagement score
        
        Args:
            social_media: {
                instagram: username,
                youtube: channel_id,
                spotify: artist_id
            }
            
        Returns:
            Verification result with scores per platform
        """
        try:
            logger.info(f"Verifying social media: {social_media}")
            
            platform_scores = {}
            
            # Verify Instagram
            if social_media.get('instagram'):
                instagram_score = self._verify_instagram(social_media['instagram'])
                platform_scores['instagram'] = instagram_score
            
            # Verify YouTube
            if social_media.get('youtube'):
                youtube_score = self._verify_youtube(social_media['youtube'])
                platform_scores['youtube'] = youtube_score
            
            # Verify Spotify
            if social_media.get('spotify'):
                spotify_score = self._verify_spotify(social_media['spotify'])
                platform_scores['spotify'] = spotify_score
            
            # Calculate overall score
            if platform_scores:
                overall_score = sum(platform_scores.values()) / len(platform_scores)
                verified = overall_score > 0.4
            else:
                overall_score = 0.0
                verified = False
            
            result = {
                'verified': verified,
                'overall_score': round(overall_score, 3),
                'platforms': platform_scores,
                'platform_count': len(platform_scores)
            }
            
            logger.info(f"Social media verification: Score={overall_score:.3f}, Platforms={len(platform_scores)}")
            
            return result
            
        except Exception as e:
            logger.error(f"Error verifying social media: {str(e)}")
            return {
                'verified': False,
                'overall_score': 0.0,
                'platforms': {},
                'error': str(e)
            }
    
    def _verify_instagram(self, username: str) -> float:
        """
        Verify Instagram account and calculate score
        Based on: followers, engagement, verified badge
        """
        try:
            # In production: Use Instagram Graph API
            # For now: Mock scoring based on username validity
            
            if not username or len(username) < 3:
                return 0.0
            
            # Basic validation
            if not re.match(r'^[a-zA-Z0-9._]+$', username):
                return 0.2
            
            # Mock scoring (replace with API call)
            # Assume moderate presence
            score = 0.6
            
            logger.info(f"Instagram verification for @{username}: {score}")
            
            return score
            
        except Exception as e:
            logger.warning(f"Error verifying Instagram: {str(e)}")
            return 0.3
    
    def _verify_youtube(self, channel_id: str) -> float:
        """
        Verify YouTube channel and calculate score
        Based on: subscribers, views, video count
        """
        try:
            if not channel_id:
                return 0.0
            
            # In production: Use YouTube Data API v3
            # Example API call (if API key available):
            # url = f"https://www.googleapis.com/youtube/v3/channels?part=statistics&id={channel_id}&key={self.youtube_api_key}"
            
            # Mock scoring
            score = 0.6
            
            logger.info(f"YouTube verification for {channel_id}: {score}")
            
            return score
            
        except Exception as e:
            logger.warning(f"Error verifying YouTube: {str(e)}")
            return 0.3
    
    def _verify_spotify(self, artist_id: str) -> float:
        """
        Verify Spotify artist profile
        Based on: monthly listeners, followers, verified badge
        """
        try:
            if not artist_id:
                return 0.0
            
            # In production: Use Spotify Web API
            # Would need OAuth token
            
            # Mock scoring
            score = 0.6
            
            logger.info(f"Spotify verification for {artist_id}: {score}")
            
            return score
            
        except Exception as e:
            logger.warning(f"Error verifying Spotify: {str(e)}")
            return 0.3
    
    def _verify_portfolio(self, verified_songs_count: int, portfolio_urls: list) -> float:
        """
        Verify artist portfolio (published songs, releases)
        
        Args:
            verified_songs_count: Number of verified songs published
            portfolio_urls: Links to artist's work
            
        Returns:
            Portfolio score (0.0 to 1.0)
        """
        try:
            score = 0.0
            
            # Score based on verified songs
            if verified_songs_count >= 10:
                score += 0.6
            elif verified_songs_count >= 5:
                score += 0.4
            elif verified_songs_count >= 1:
                score += 0.2
            
            # Score based on portfolio links
            valid_urls = [url for url in portfolio_urls if self._is_valid_url(url)]
            
            if len(valid_urls) >= 5:
                score += 0.4
            elif len(valid_urls) >= 3:
                score += 0.3
            elif len(valid_urls) >= 1:
                score += 0.2
            
            # Cap at 1.0
            score = min(score, 1.0)
            
            logger.info(f"Portfolio verification: Songs={verified_songs_count}, URLs={len(valid_urls)}, Score={score}")
            
            return score
            
        except Exception as e:
            logger.warning(f"Error verifying portfolio: {str(e)}")
            return 0.0
    
    def _is_valid_url(self, url: str) -> bool:
        """
        Check if URL is valid
        """
        if not url:
            return False
        
        # Basic URL pattern
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain
            r'localhost|'  # localhost
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # IP
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        return bool(url_pattern.match(url))
    
    def calculate_confidence_score(self, 
                                   document_score: float,
                                   social_media_score: float,
                                   portfolio_score: float) -> float:
        """
        Calculate overall confidence score
        
        Weights:
        - Document: 30%
        - Social Media: 40%
        - Portfolio: 30%
        """
        confidence = (
            document_score * 0.3 +
            social_media_score * 0.4 +
            portfolio_score * 0.3
        )
        
        return round(confidence, 3)

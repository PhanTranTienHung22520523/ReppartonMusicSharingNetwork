"""
Repparton AI Service - Main Flask Application
Provides AI capabilities for music analysis, recommendation, and artist verification
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
import traceback

from modules.music_analyzer import MusicAnalyzer
from modules.recommender import SongRecommender
from modules.artist_verifier import ArtistVerifier
from utils.file_handler import FileHandler
from utils.logger import setup_logger

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB max file size
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(__file__), 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'mp3', 'wav', 'flac', 'ogg', 'm4a'}

# Setup logging
logger = setup_logger()

# Initialize AI modules
music_analyzer = MusicAnalyzer()
song_recommender = SongRecommender()
artist_verifier = ArtistVerifier()
file_handler = FileHandler(app.config['UPLOAD_FOLDER'])

# Ensure upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)


# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Repparton AI Service',
        'version': '1.0.0',
        'modules': {
            'music_analyzer': 'active',
            'song_recommender': 'active',
            'artist_verifier': 'active'
        }
    }), 200


# ==================== MUSIC ANALYSIS ENDPOINTS ====================

@app.route('/api/ai/music/analyze', methods=['POST'])
def analyze_music():
    """
    Analyze audio file for tempo, key, mood, energy, etc.
    
    Request:
        - file: audio file (mp3, wav, flac, etc.)
        - song_id: optional song identifier
    
    Response:
        {
            "song_id": "...",
            "analysis": {
                "tempo": 120.5,
                "key": "C major",
                "energy": 0.85,
                "danceability": 0.72,
                "mood": "happy",
                "acousticness": 0.3,
                "instrumentalness": 0.1,
                "spectral_features": {...}
            }
        }
    """
    try:
        # Check if file is present
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        song_id = request.form.get('song_id', None)
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file_handler.allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format'}), 400
        
        # Save file temporarily
        filepath = file_handler.save_file(file)
        
        try:
            # Analyze the audio file
            logger.info(f"Analyzing audio file: {filepath}")
            analysis_result = music_analyzer.analyze(filepath)
            
            # Clean up temporary file
            file_handler.delete_file(filepath)
            
            return jsonify({
                'song_id': song_id,
                'analysis': analysis_result,
                'status': 'success'
            }), 200
            
        except Exception as e:
            file_handler.delete_file(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Error analyzing music: {str(e)}")
        logger.error(traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/music/extract-features', methods=['POST'])
def extract_features():
    """
    Extract detailed audio features for machine learning
    
    Returns:
        MFCC, Chroma, Spectral features, etc.
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if not file_handler.allowed_file(file.filename):
            return jsonify({'error': 'Invalid file format'}), 400
        
        filepath = file_handler.save_file(file)
        
        try:
            features = music_analyzer.extract_features(filepath)
            file_handler.delete_file(filepath)
            
            return jsonify({
                'features': features,
                'status': 'success'
            }), 200
            
        except Exception as e:
            file_handler.delete_file(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Error extracting features: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== RECOMMENDATION ENDPOINTS ====================

@app.route('/api/ai/recommend/by-song', methods=['POST'])
def recommend_by_song():
    """
    Get song recommendations based on a single song
    
    Request:
        {
            "song_id": "123",
            "audio_features": {...},  // from music analysis
            "limit": 10
        }
    
    Response:
        {
            "recommendations": [
                {
                    "song_id": "456",
                    "similarity_score": 0.92,
                    "reason": "Similar tempo and mood"
                },
                ...
            ]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'audio_features' not in data:
            return jsonify({'error': 'Missing audio_features'}), 400
        
        song_id = data.get('song_id')
        audio_features = data['audio_features']
        limit = data.get('limit', 10)
        
        recommendations = song_recommender.recommend_by_features(
            audio_features, 
            limit=limit
        )
        
        return jsonify({
            'song_id': song_id,
            'recommendations': recommendations,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in recommendation: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/recommend/by-user', methods=['POST'])
def recommend_by_user():
    """
    Get personalized recommendations based on user listening history
    
    Request:
        {
            "user_id": "user123",
            "listening_history": [
                {"song_id": "1", "play_count": 10, "liked": true},
                {"song_id": "2", "play_count": 5, "liked": false}
            ],
            "limit": 20
        }
    
    Response:
        {
            "recommendations": [...]
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'Missing user_id'}), 400
        
        user_id = data['user_id']
        listening_history = data.get('listening_history', [])
        limit = data.get('limit', 20)
        
        recommendations = song_recommender.recommend_by_user(
            user_id,
            listening_history,
            limit=limit
        )
        
        return jsonify({
            'user_id': user_id,
            'recommendations': recommendations,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in user recommendation: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/recommend/train', methods=['POST'])
def train_recommender():
    """
    Train recommendation model with new data
    
    Request:
        {
            "songs": [...],  // array of songs with features
            "interactions": [...]  // user-song interactions
        }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No training data provided'}), 400
        
        songs = data.get('songs', [])
        interactions = data.get('interactions', [])
        
        result = song_recommender.train(songs, interactions)
        
        return jsonify({
            'status': 'success',
            'message': 'Model trained successfully',
            'metrics': result
        }), 200
        
    except Exception as e:
        logger.error(f"Error training recommender: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== ARTIST VERIFICATION ENDPOINTS ====================

@app.route('/api/ai/artist/verify', methods=['POST'])
def verify_artist():
    """
    Verify artist application and calculate confidence score
    
    Request:
        {
            "user_id": "user123",
            "artist_name": "John Doe",
            "document_url": "https://...",
            "social_media": {
                "instagram": "johndoe",
                "youtube": "johndoechannel",
                "spotify": "spotify_artist_id"
            },
            "verified_songs_count": 5,
            "portfolio_urls": [...]
        }
    
    Response:
        {
            "verification_result": {
                "confidence_score": 0.85,
                "status": "approved",  // approved, pending, rejected
                "document_verified": true,
                "social_media_verified": true,
                "portfolio_verified": true,
                "details": {
                    "document_score": 0.9,
                    "social_media_score": 0.8,
                    "portfolio_score": 0.85
                },
                "recommendation": "Auto-approve",
                "reason": "High confidence score with verified documents and social media"
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'user_id' not in data:
            return jsonify({'error': 'Missing user_id'}), 400
        
        verification_result = artist_verifier.verify_application(data)
        
        return jsonify({
            'verification_result': verification_result,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Error in artist verification: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/artist/verify-document', methods=['POST'])
def verify_document():
    """
    Verify identity document (ID card, passport, etc.)
    
    Request:
        - file: document image
        - expected_name: artist name to verify
    """
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        expected_name = request.form.get('expected_name', '')
        
        filepath = file_handler.save_file(file)
        
        try:
            result = artist_verifier.verify_document(filepath, expected_name)
            file_handler.delete_file(filepath)
            
            return jsonify({
                'verification_result': result,
                'status': 'success'
            }), 200
            
        except Exception as e:
            file_handler.delete_file(filepath)
            raise e
            
    except Exception as e:
        logger.error(f"Error verifying document: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/ai/artist/verify-social-media', methods=['POST'])
def verify_social_media():
    """
    Verify social media presence and engagement
    
    Request:
        {
            "social_media": {
                "instagram": "username",
                "youtube": "channel_id",
                "spotify": "artist_id"
            }
        }
    """
    try:
        data = request.get_json()
        
        if not data or 'social_media' not in data:
            return jsonify({'error': 'Missing social_media data'}), 400
        
        result = artist_verifier.verify_social_media(data['social_media'])
        
        return jsonify({
            'verification_result': result,
            'status': 'success'
        }), 200
        
    except Exception as e:
        logger.error(f"Error verifying social media: {str(e)}")
        return jsonify({'error': str(e)}), 500


# ==================== ERROR HANDLERS ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({'error': 'Internal server error'}), 500


# ==================== MAIN ====================

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Repparton AI Service on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )

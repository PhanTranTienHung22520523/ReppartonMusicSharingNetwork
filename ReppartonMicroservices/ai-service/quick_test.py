"""
Quick test script for AI Service
Tests Flask app startup without full module initialization
"""

from flask import Flask, jsonify
from flask_cors import CORS
import os
import sys

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

# Initialize Flask app
app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Repparton AI Service - Quick Test',
        'version': '1.0.0-test'
    }), 200

@app.route('/test', methods=['GET'])
def test():
    """Test endpoint"""
    return jsonify({
        'message': 'AI Service is running!',
        'python_version': sys.version,
        'flask_working': True
    }), 200

if __name__ == '__main__':
    port = 5000
    print(f"\n{'='*60}")
    print(f"🚀 Starting AI Service Quick Test on http://localhost:{port}")
    print(f"{'='*60}")
    print(f"📍 Health check: http://localhost:{port}/health")
    print(f"📍 Test endpoint: http://localhost:{port}/test")
    print(f"{'='*60}\n")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )

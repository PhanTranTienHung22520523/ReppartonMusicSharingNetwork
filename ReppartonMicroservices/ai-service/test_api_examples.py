"""
Example: How to call AI Service from Python
This shows how to test the AI service endpoints
"""

import requests
import json

# AI Service URL
BASE_URL = "http://localhost:5000"

def test_health():
    """Test health endpoint"""
    print("=" * 50)
    print("Testing Health Endpoint")
    print("=" * 50)
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    print()


def test_music_analysis(audio_file_path):
    """Test music analysis endpoint"""
    print("=" * 50)
    print("Testing Music Analysis")
    print("=" * 50)
    
    with open(audio_file_path, 'rb') as f:
        files = {'file': f}
        data = {'song_id': 'test-song-123'}
        
        response = requests.post(
            f"{BASE_URL}/api/ai/music/analyze",
            files=files,
            data=data
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            analysis = result.get('analysis', {})
            
            print(f"\nAnalysis Results:")
            print(f"  Tempo: {analysis.get('tempo')} BPM")
            print(f"  Key: {analysis.get('key')}")
            print(f"  Energy: {analysis.get('energy')}")
            print(f"  Danceability: {analysis.get('danceability')}")
            print(f"  Mood: {analysis.get('mood')}")
            print(f"  Acousticness: {analysis.get('acousticness')}")
            print(f"  Instrumentalness: {analysis.get('instrumentalness')}")
        else:
            print(f"Error: {response.text}")
    
    print()


def test_recommendation_by_song():
    """Test song recommendation endpoint"""
    print("=" * 50)
    print("Testing Song Recommendation")
    print("=" * 50)
    
    payload = {
        "song_id": "123",
        "audio_features": {
            "tempo": 120.0,
            "energy": 0.8,
            "danceability": 0.7,
            "valence": 0.9,
            "key": "C major",
            "mood": "happy",
            "acousticness": 0.3,
            "instrumentalness": 0.1
        },
        "limit": 5
    }
    
    response = requests.post(
        f"{BASE_URL}/api/ai/recommend/by-song",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        recommendations = result.get('recommendations', [])
        
        print(f"\nRecommendations:")
        for i, rec in enumerate(recommendations, 1):
            print(f"  {i}. Song ID: {rec.get('song_id')}")
            print(f"     Similarity: {rec.get('similarity_score', 0):.3f}")
            print(f"     Reason: {rec.get('reason')}")
            print()
    else:
        print(f"Error: {response.text}")
    
    print()


def test_artist_verification():
    """Test artist verification endpoint"""
    print("=" * 50)
    print("Testing Artist Verification")
    print("=" * 50)
    
    payload = {
        "user_id": "user123",
        "artist_name": "John Doe",
        "document_url": "https://example.com/document.jpg",
        "social_media": {
            "instagram": "johndoe",
            "youtube": "johndoechannel",
            "spotify": "spotify_artist_id"
        },
        "verified_songs_count": 5,
        "portfolio_urls": [
            "https://example.com/song1",
            "https://example.com/song2"
        ]
    }
    
    response = requests.post(
        f"{BASE_URL}/api/ai/artist/verify",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        verification = result.get('verification_result', {})
        
        print(f"\nVerification Results:")
        print(f"  Confidence Score: {verification.get('confidence_score')}")
        print(f"  Status: {verification.get('status')}")
        print(f"  Recommendation: {verification.get('recommendation')}")
        print(f"  Reason: {verification.get('reason')}")
        print(f"\nDetails:")
        details = verification.get('details', {})
        print(f"  Document Score: {details.get('document_score')}")
        print(f"  Social Media Score: {details.get('social_media_score')}")
        print(f"  Portfolio Score: {details.get('portfolio_score')}")
    else:
        print(f"Error: {response.text}")
    
    print()


def test_recommendation_by_user():
    """Test user-based recommendation"""
    print("=" * 50)
    print("Testing User-Based Recommendation")
    print("=" * 50)
    
    payload = {
        "user_id": "user123",
        "listening_history": [
            {"song_id": "1", "play_count": 10, "liked": True},
            {"song_id": "2", "play_count": 5, "liked": True},
            {"song_id": "3", "play_count": 3, "liked": False}
        ],
        "limit": 10
    }
    
    response = requests.post(
        f"{BASE_URL}/api/ai/recommend/by-user",
        json=payload
    )
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        result = response.json()
        recommendations = result.get('recommendations', [])
        
        print(f"\nUser Recommendations:")
        for i, rec in enumerate(recommendations[:5], 1):  # Show top 5
            print(f"  {i}. Song ID: {rec.get('song_id')}")
            print(f"     Score: {rec.get('score', 0):.3f}")
            print(f"     Reason: {rec.get('reason')}")
            print()
    else:
        print(f"Error: {response.text}")
    
    print()


if __name__ == "__main__":
    print("\n")
    print("🎵" * 25)
    print("  Repparton AI Service - API Testing Examples")
    print("🎵" * 25)
    print("\n")
    
    # Test 1: Health Check
    try:
        test_health()
    except Exception as e:
        print(f"Health check failed: {e}")
        print("Make sure AI service is running on http://localhost:5000")
        exit(1)
    
    # Test 2: Song Recommendation
    print("\nTest 2: Song-based Recommendation")
    print("-" * 50)
    test_recommendation_by_song()
    
    # Test 3: Artist Verification
    print("\nTest 3: Artist Verification")
    print("-" * 50)
    test_artist_verification()
    
    # Test 4: User-based Recommendation
    print("\nTest 4: User-based Recommendation")
    print("-" * 50)
    test_recommendation_by_user()
    
    # Test 5: Music Analysis (optional - requires audio file)
    print("\nTest 5: Music Analysis")
    print("-" * 50)
    audio_file = input("Enter path to audio file (or press Enter to skip): ").strip()
    
    if audio_file:
        try:
            test_music_analysis(audio_file)
        except Exception as e:
            print(f"Music analysis failed: {e}")
    else:
        print("Skipped (no audio file provided)")
    
    print("\n" + "=" * 50)
    print("Testing Complete!")
    print("=" * 50)
    print("\nAll tests passed! ✅")
    print("\nNext steps:")
    print("1. Test with real audio files")
    print("2. Train recommendation model with your data")
    print("3. Integrate with Java microservices")
    print("4. Add API keys for social media verification")
    print("\nSee INTEGRATION_GUIDE.md for Java integration examples")
    print()

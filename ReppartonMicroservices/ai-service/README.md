# Repparton AI Service 🎵🤖

AI-powered music analysis, recommendation, and artist verification service for Repparton Music Sharing Network.

## 🌟 Features

### 1. **Music Analysis** 🎼
Analyze audio files to extract:
- **Tempo** (BPM)
- **Musical Key** & Scale
- **Energy Level**
- **Danceability**
- **Mood** (happy, sad, energetic, calm, etc.)
- **Acousticness**
- **Instrumentalness**
- **Valence** (musical positivity)
- **Spectral Features** (MFCC, Chroma, etc.)

### 2. **Song Recommendation** 🎯
Hybrid recommendation system:
- **Content-Based Filtering**: Based on audio features similarity
- **Collaborative Filtering**: Based on user listening patterns
- **Personalized Recommendations**: Tailored to user preferences

### 3. **Artist Verification** ✅
AI-powered artist verification:
- **Document Verification**: ID/passport validation
- **Social Media Check**: Instagram, YouTube, Spotify presence
- **Portfolio Analysis**: Published songs and releases
- **Auto-Approval**: Confidence score >= 0.7
- **Auto-Rejection**: Confidence score < 0.4
- **Manual Review**: Confidence score 0.4 - 0.7

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- FFmpeg (for audio processing)
- (Optional) Tesseract OCR (for document verification)

### Installation

1. **Clone the repository**
```bash
cd ReppartonMicroservices/ai-service
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
cp .env.template .env
# Edit .env with your API keys
```

5. **Run the service**
```bash
python src/app.py
```

The service will start on `http://localhost:5000`

## 🐳 Docker Deployment

### Build and run with Docker
```bash
docker build -t repparton-ai-service .
docker run -p 5000:5000 --env-file .env repparton-ai-service
```

### Or use Docker Compose
```bash
docker-compose up -d
```

## 📚 API Documentation

### Health Check
```http
GET /health
```

### Music Analysis

#### Analyze Audio File
```http
POST /api/ai/music/analyze
Content-Type: multipart/form-data

file: <audio_file>
song_id: <optional_song_id>
```

**Response:**
```json
{
  "song_id": "123",
  "analysis": {
    "tempo": 120.5,
    "key": "C major",
    "energy": 0.85,
    "danceability": 0.72,
    "mood": "happy",
    "acousticness": 0.3,
    "instrumentalness": 0.1,
    "valence": 0.8,
    "loudness": -5.2,
    "spectral_centroid": 2500.0
  },
  "status": "success"
}
```

#### Extract Features for ML
```http
POST /api/ai/music/extract-features
Content-Type: multipart/form-data

file: <audio_file>
```

### Song Recommendation

#### Recommend by Song Features
```http
POST /api/ai/recommend/by-song
Content-Type: application/json

{
  "song_id": "123",
  "audio_features": {
    "tempo": 120,
    "energy": 0.8,
    "mood": "happy",
    ...
  },
  "limit": 10
}
```

**Response:**
```json
{
  "song_id": "123",
  "recommendations": [
    {
      "song_id": "456",
      "similarity_score": 0.92,
      "reason": "Similar tempo and mood"
    }
  ]
}
```

#### Recommend by User History
```http
POST /api/ai/recommend/by-user
Content-Type: application/json

{
  "user_id": "user123",
  "listening_history": [
    {
      "song_id": "1",
      "play_count": 10,
      "liked": true
    }
  ],
  "limit": 20
}
```

#### Train Recommendation Model
```http
POST /api/ai/recommend/train
Content-Type: application/json

{
  "songs": [
    {
      "song_id": "1",
      "features": {...}
    }
  ],
  "interactions": [
    {
      "user_id": "user1",
      "song_id": "1",
      "play_count": 5,
      "liked": true
    }
  ]
}
```

### Artist Verification

#### Verify Artist Application
```http
POST /api/ai/artist/verify
Content-Type: application/json

{
  "user_id": "user123",
  "artist_name": "John Doe",
  "document_url": "https://...",
  "social_media": {
    "instagram": "johndoe",
    "youtube": "channel_id",
    "spotify": "artist_id"
  },
  "verified_songs_count": 5,
  "portfolio_urls": [...]
}
```

**Response:**
```json
{
  "verification_result": {
    "confidence_score": 0.85,
    "status": "approved",
    "document_verified": true,
    "social_media_verified": true,
    "portfolio_verified": true,
    "details": {
      "document_score": 0.9,
      "social_media_score": 0.8,
      "portfolio_score": 0.85
    },
    "recommendation": "Auto-approve",
    "reason": "High confidence score..."
  }
}
```

#### Verify Document Only
```http
POST /api/ai/artist/verify-document
Content-Type: multipart/form-data

file: <document_image>
expected_name: "John Doe"
```

#### Verify Social Media Only
```http
POST /api/ai/artist/verify-social-media
Content-Type: application/json

{
  "social_media": {
    "instagram": "username",
    "youtube": "channel_id",
    "spotify": "artist_id"
  }
}
```

## 🔧 Integration with Java Microservices

### Example: Song Service Integration

```java
@Service
public class SongAIService {
    
    private final RestTemplate restTemplate;
    private static final String AI_SERVICE_URL = "http://localhost:5000/api/ai";
    
    public SongAnalysis analyzeSong(MultipartFile audioFile, String songId) {
        // Prepare request
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", audioFile.getResource());
        body.add("song_id", songId);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        
        HttpEntity<MultiValueMap<String, Object>> requestEntity = 
            new HttpEntity<>(body, headers);
        
        // Call AI service
        ResponseEntity<AIAnalysisResponse> response = restTemplate.postForEntity(
            AI_SERVICE_URL + "/music/analyze",
            requestEntity,
            AIAnalysisResponse.class
        );
        
        return response.getBody().getAnalysis();
    }
}
```

### Example: User Service Integration (Artist Verification)

```java
@Service
public class ArtistVerificationService {
    
    private final RestTemplate restTemplate;
    private static final String AI_SERVICE_URL = "http://localhost:5000/api/ai";
    
    public VerificationResult verifyArtist(ArtistApplication application) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        
        Map<String, Object> request = new HashMap<>();
        request.put("user_id", application.getUserId());
        request.put("artist_name", application.getArtistName());
        request.put("document_url", application.getDocumentUrl());
        request.put("social_media", application.getSocialMedia());
        request.put("verified_songs_count", application.getVerifiedSongsCount());
        
        HttpEntity<Map<String, Object>> requestEntity = 
            new HttpEntity<>(request, headers);
        
        ResponseEntity<VerificationResponse> response = restTemplate.postForEntity(
            AI_SERVICE_URL + "/artist/verify",
            requestEntity,
            VerificationResponse.class
        );
        
        return response.getBody().getVerificationResult();
    }
}
```

## 🛠️ Technology Stack

- **Framework**: Flask 3.0
- **Audio Analysis**: librosa, essentia
- **Machine Learning**: scikit-learn, surprise
- **Image Processing**: OpenCV, Pillow
- **Server**: Gunicorn (production)

## 📊 Model Training

To train the recommendation model with your data:

```python
# Prepare your data
songs = [
    {
        "song_id": "1",
        "features": {
            "tempo": 120,
            "energy": 0.8,
            "mood": "happy",
            ...
        }
    }
]

interactions = [
    {
        "user_id": "user1",
        "song_id": "1",
        "play_count": 10,
        "liked": True,
        "timestamp": "2024-01-01T00:00:00Z"
    }
]

# Call training endpoint
POST /api/ai/recommend/train
```

## 🔐 Security

- Set `API_KEY` in `.env` to secure endpoints (optional)
- Use HTTPS in production
- Configure `CORS_ORIGINS` to restrict access
- Keep API keys (Instagram, YouTube, Spotify) confidential

## 📈 Performance

- **Workers**: Configure via `WORKERS` in `.env`
- **Timeout**: Adjust `TIMEOUT` for long-running tasks
- **Caching**: Enable `ENABLE_CACHING` for better performance

## 🐛 Troubleshooting

### FFmpeg not found
```bash
# Ubuntu/Debian
sudo apt-get install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### Librosa installation issues
```bash
pip install --upgrade pip
pip install librosa==0.10.1 --no-cache-dir
```

## 📝 License

Part of Repparton Music Sharing Network

## 👥 Authors

Repparton Development Team

## 🤝 Contributing

Contributions welcome! Please follow the coding standards and add tests.

## 📞 Support

For issues and questions, please open an issue on GitHub.

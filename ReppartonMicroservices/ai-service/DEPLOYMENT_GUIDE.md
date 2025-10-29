# 🚀 AI Service Deployment & Testing Guide

## 📋 Quick Reference

**Service URL**: `http://localhost:5000`  
**Technology**: Python 3.9+, Flask  
**Main Features**: Music Analysis, Song Recommendation, Artist Verification

---

## 🏃 Quick Start (Windows)

```powershell
cd ReppartonMicroservices\ai-service
.\start.bat
```

## 🏃 Quick Start (Linux/Mac)

```bash
cd ReppartonMicroservices/ai-service
chmod +x start.sh
./start.sh
```

---

## 📝 Manual Setup

### 1. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note**: Some packages may require additional system dependencies:

**Windows:**
```powershell
# Install FFmpeg
# Download from: https://ffmpeg.org/download.html
# Add to PATH
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg libsndfile1 python3-dev
```

**macOS:**
```bash
brew install ffmpeg
```

### 3. Configure Environment

```bash
# Copy template
cp .env.template .env

# Edit .env file with your API keys (optional)
nano .env
```

### 4. Run the Service

```bash
# Development mode
python src/app.py

# Production mode with Gunicorn
gunicorn --bind 0.0.0.0:5000 --workers 4 src.app:app
```

---

## 🐳 Docker Deployment

### Build Docker Image

```bash
docker build -t repparton-ai-service .
```

### Run with Docker

```bash
docker run -d \
  --name ai-service \
  -p 5000:5000 \
  --env-file .env \
  -v $(pwd)/uploads:/app/uploads \
  -v $(pwd)/logs:/app/logs \
  repparton-ai-service
```

### Run with Docker Compose

```bash
docker-compose up -d
```

### Check Logs

```bash
docker logs -f ai-service
```

---

## 🧪 Testing the Service

### 1. Health Check

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "service": "Repparton AI Service",
  "version": "1.0.0",
  "modules": {
    "music_analyzer": "active",
    "song_recommender": "active",
    "artist_verifier": "active"
  }
}
```

### 2. Test Music Analysis

**Using cURL:**
```bash
curl -X POST http://localhost:5000/api/ai/music/analyze \
  -F "file=@sample.mp3" \
  -F "song_id=test123"
```

**Using Python:**
```python
import requests

url = "http://localhost:5000/api/ai/music/analyze"
files = {'file': open('sample.mp3', 'rb')}
data = {'song_id': 'test123'}

response = requests.post(url, files=files, data=data)
print(response.json())
```

### 3. Test Song Recommendation

```bash
curl -X POST http://localhost:5000/api/ai/recommend/by-song \
  -H "Content-Type: application/json" \
  -d '{
    "song_id": "123",
    "audio_features": {
      "tempo": 120,
      "energy": 0.8,
      "mood": "happy",
      "key": "C major"
    },
    "limit": 10
  }'
```

### 4. Test Artist Verification

```bash
curl -X POST http://localhost:5000/api/ai/artist/verify \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "artist_name": "John Doe",
    "document_url": "https://example.com/doc.jpg",
    "social_media": {
      "instagram": "johndoe",
      "youtube": "johndoechannel"
    },
    "verified_songs_count": 5,
    "portfolio_urls": ["https://example.com/song1"]
  }'
```

---

## 🔧 Integration with Java Services

### 1. Add AI Service URL to application.yml

```yaml
# song-service/src/main/resources/application.yml
ai:
  service:
    url: http://localhost:5000
```

### 2. Enable in Docker Network (if using Docker)

```yaml
# docker-compose.yml (add to main compose file)
services:
  ai-service:
    image: repparton-ai-service
    networks:
      - repparton-network
```

### 3. Test Integration

See `INTEGRATION_GUIDE.md` for detailed Java integration code.

---

## 📊 Performance Tuning

### For Production

**Gunicorn Configuration:**
```bash
gunicorn \
  --bind 0.0.0.0:5000 \
  --workers 4 \
  --threads 2 \
  --timeout 120 \
  --worker-class sync \
  --access-logfile logs/access.log \
  --error-logfile logs/error.log \
  src.app:app
```

**Environment Variables:**
```bash
export WORKERS=4
export TIMEOUT=120
export LOG_LEVEL=INFO
```

### Memory Requirements

- **Minimum**: 2GB RAM
- **Recommended**: 4GB RAM
- **With ML Models**: 8GB RAM

### CPU Requirements

- **Minimum**: 2 cores
- **Recommended**: 4 cores
- **With GPU**: CUDA-compatible GPU for deep learning features

---

## 🐛 Troubleshooting

### Issue: "librosa not found"

```bash
pip install librosa==0.10.1 --no-cache-dir
```

### Issue: "FFmpeg not found"

Install FFmpeg and add to PATH:
- Windows: https://ffmpeg.org/download.html
- Ubuntu: `sudo apt-get install ffmpeg`
- macOS: `brew install ffmpeg`

### Issue: "Port 5000 already in use"

Change port in `.env`:
```
PORT=5001
```

Or specify when running:
```bash
PORT=5001 python src/app.py
```

### Issue: "Import errors"

Ensure virtual environment is activated:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Issue: "Memory errors during audio analysis"

Reduce number of workers or analyze smaller chunks:
```python
# In .env
WORKERS=2
```

---

## 📈 Monitoring

### Check Service Status

```bash
# Health check
curl http://localhost:5000/health

# Check logs
tail -f logs/ai-service_*.log
```

### Metrics to Monitor

1. **Response Time**: Music analysis should complete in 30-60s
2. **Memory Usage**: Should stay under 2GB per worker
3. **Error Rate**: Should be < 1%
4. **Uptime**: Target 99.9%

---

## 🔒 Security Checklist

- [ ] Set `DEBUG=False` in production
- [ ] Configure `API_KEY` in `.env`
- [ ] Set `CORS_ORIGINS` to specific domains
- [ ] Use HTTPS in production
- [ ] Keep API keys (Instagram, YouTube, Spotify) secret
- [ ] Limit file upload size
- [ ] Enable rate limiting (recommended)
- [ ] Regular security updates

---

## 📦 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/api/ai/music/analyze` | POST | Analyze audio file |
| `/api/ai/music/extract-features` | POST | Extract ML features |
| `/api/ai/recommend/by-song` | POST | Song-based recommendations |
| `/api/ai/recommend/by-user` | POST | User-based recommendations |
| `/api/ai/recommend/train` | POST | Train recommendation model |
| `/api/ai/artist/verify` | POST | Verify artist application |
| `/api/ai/artist/verify-document` | POST | Verify document only |
| `/api/ai/artist/verify-social-media` | POST | Verify social media only |

---

## 🎯 Next Steps

1. ✅ Service is running
2. ⬜ Test all endpoints
3. ⬜ Integrate with Song Service
4. ⬜ Integrate with User Service
5. ⬜ Integrate with Recommendation Service
6. ⬜ Train recommendation model with real data
7. ⬜ Add API keys for social media verification
8. ⬜ Deploy to production

---

## 📞 Support

For issues:
1. Check logs in `logs/` directory
2. Verify dependencies are installed
3. Check network connectivity
4. Review INTEGRATION_GUIDE.md for Java integration

---

## 📄 Related Documentation

- `README.md` - Overview and features
- `INTEGRATION_GUIDE.md` - Java service integration
- `.env.template` - Configuration options
- `requirements.txt` - Python dependencies

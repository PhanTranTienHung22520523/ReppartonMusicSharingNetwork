import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useLanguage } from "../contexts/LanguageContext";
import MainLayout from "../components/MainLayout";
import { useEffect, useState } from "react";
import { getShareCountBySong, shareSong } from "../api/shareService";
import { useAuth } from "../contexts/AuthContext";
import CommentSection from "../components/CommentSection";
import "./Listen.css";

export default function Listen() {
  const { currentSong, isPlaying } = useMusicPlayer();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [shareCount, setShareCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (currentSong) {
      getShareCountBySong(currentSong.id)
        .then(data => setShareCount(Array.isArray(data) ? data.length : data.count || 0))
        .catch(() => setShareCount(0));
    }
  }, [currentSong]);

  const handleShare = async () => {
    if (!user || !currentSong) return;
    await shareSong({ userId: user.id, songId: currentSong.id, platform: "web" });
    getShareCountBySong(currentSong.id)
      .then(data => setShareCount(Array.isArray(data) ? data.length : data.count || 0));
    alert("Đã chia sẻ bài hát!");
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  if (!currentSong) {
    return (
      <MainLayout>
        <div className="no-song-container">
          <div className="no-song-content">
            <i className="bi bi-music-note-beamed no-song-icon"></i>
            <h3>{t("listen.noSong")}</h3>
            <p>{t("listen.chooseSong")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="listen-page">
        {/* Animated Background */}
        <div className="listen-bg-gradient"></div>
        <div className="listen-bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>

        <div className="row justify-content-center position-relative">
          {/* Left Column: Song Info */}
          <div className="col-md-7 d-flex flex-column align-items-center">
            {/* Album Art with Vinyl Effect */}
            <div className="album-container">
              <div className={`vinyl-disc ${isPlaying ? 'spinning' : ''}`}>
                <div className="vinyl-center"></div>
              </div>
              <div className={`album-cover ${isPlaying ? 'playing' : ''}`}>
                <img 
                  src={currentSong.coverUrl || '/default-cover.png'} 
                  alt="cover"
                  onError={(e) => e.target.src = '/default-cover.png'}
                />
                <div className="album-overlay">
                  <div className="sound-waves">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Song Title with Animation */}
            <h1 className="song-title">{currentSong.title}</h1>
            <div className="artist-name">{currentSong.artist?.username || currentSong.artistName}</div>

            {/* Stats with Icons */}
            <div className="song-stats">
              <div className="stat-item">
                <i className="bi bi-headphones"></i>
                <span>{(currentSong.views || 0).toLocaleString()}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <i className="bi bi-clock-history"></i>
                <span>{currentSong.createdAt ? new Date(currentSong.createdAt).toLocaleDateString() : "Today"}</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <i className="bi bi-share"></i>
                <span>{shareCount}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className={`action-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                <span>{t("music.like")}</span>
              </button>
              <button className="action-btn" onClick={handleShare}>
                <i className="bi bi-share"></i>
                <span>{t("music.share")}</span>
              </button>
              <button className="action-btn">
                <i className="bi bi-music-note-list"></i>
                <span>{t("listen.addToPlaylist")}</span>
              </button>
              <button className="action-btn">
                <i className="bi bi-download"></i>
                <span>{t("music.download")}</span>
              </button>
            </div>

            {/* Description */}
            {currentSong.description && (
              <div className="song-description">
                <h5>{t("listen.about")}</h5>
                <p>{currentSong.description}</p>
              </div>
            )}
          </div>

          {/* Right Column: Comments */}
          <div className="col-md-4">
            <div className="comments-container">
              <CommentSection songId={currentSong.id} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
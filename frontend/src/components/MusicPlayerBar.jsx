import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";
import "./MusicPlayerBar.css";

export default function MusicPlayerBar() {
  const { currentSong, playing, setPlaying, playNext, playPrev, playRandom, currentTime, setCurrentTime } = useMusicPlayer();
  const { user } = useAuth();
  const { settings, updateSetting } = useSettings();
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const audioRef = useRef();
  const navigate = useNavigate();

  // Get audio settings
  const { volume } = settings.audio;

  // Khi currentSong đổi, set lại thời gian phát
  useEffect(() => {
    if (audioRef.current && currentTime > 0) {
      audioRef.current.currentTime = currentTime;
      setCurrent(currentTime);
    } else if (audioRef.current) {
      setCurrent(0);
    }
  }, [currentSong, currentTime]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
      if (playing) audioRef.current.play();
      else audioRef.current.pause();
    }
  }, [playing, volume, currentSong]);

  // Khi phát nhạc, cập nhật currentTime vào context
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrent(Math.floor(audioRef.current.currentTime));
      setCurrentTime(Math.floor(audioRef.current.currentTime));
    }
  };

  const formatTime = (s) =>
    s ? `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}` : "0:00";

  if (!currentSong) return null;

  return (
    <div
      className="music-player-bar"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 90,
        zIndex: 999,
        userSelect: "none",
        background: "var(--surface-color)",
        borderTop: "1px solid var(--border-color)",
        backdropFilter: "blur(10px)",
        display: "grid",
        gridTemplateColumns: "1fr 2fr 1fr",
        alignItems: "center",
        padding: "0 16px",
        gap: "16px"
      }}
    >
      {/* Left: Song Info */}
      <div
        className="d-flex align-items-center"
        style={{ 
          cursor: "pointer",
          minWidth: 0,
          gap: 12
        }}
        onClick={() => navigate("/listen")}
      >
        <img
          src={currentSong.coverUrl}
          alt="cover"
          style={{
            width: 56,
            height: 56,
            borderRadius: 4,
            objectFit: "cover",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="text-truncate"
            style={{ 
              color: "var(--text-color)", 
              fontSize: 14,
              fontWeight: 400,
              marginBottom: 4
            }}
          >
            {currentSong.title}
          </div>
          <div
            className="text-truncate"
            style={{ 
              fontSize: 11, 
              color: "var(--text-muted)"
            }}
          >
            {currentSong.artist?.username || currentSong.artistName}
          </div>
        </div>
        {user && (
          <button
            className="btn btn-sm"
            style={{ 
              width: 28,
              height: 28,
              padding: 0,
              background: "transparent",
              color: liked ? "#1db954" : "var(--text-muted)",
              border: "none",
              transition: "all 0.2s ease",
              fontSize: 16
            }}
            onClick={(e) => {
              e.stopPropagation();
              setLiked((l) => !l);
            }}
            title="Like"
          >
            <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>
        )}
      </div>

      {/* Center: Controls + Timeline */}
      <div 
        className="d-flex flex-column align-items-center" 
        style={{ 
          maxWidth: 722,
          width: "100%"
        }}
      >
        <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
          <button
            className="btn"
            style={{ 
              width: 32,
              height: 32,
              padding: 0,
              background: "transparent",
              color: shuffle ? "#1db954" : "var(--text-muted)",
              border: "none",
              transition: "all 0.15s ease",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => setShuffle((s) => !s)}
            title="Shuffle"
            onMouseEnter={(e) => {
              if (!shuffle) e.currentTarget.style.color = "var(--text-color)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              if (!shuffle) e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="bi bi-shuffle"></i>
          </button>
          <button
            className="btn"
            style={{ 
              width: 32,
              height: 32,
              padding: 0,
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              transition: "all 0.15s ease",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Previous"
            onClick={playPrev}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-color)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="bi bi-skip-start-fill"></i>
          </button>
          <button
            className="btn"
            style={{ 
              borderRadius: "50%", 
              width: 32, 
              height: 32, 
              padding: 0,
              fontSize: 16,
              background: "#fff",
              color: "#000",
              border: "none",
              transition: "all 0.15s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => setPlaying((p) => !p)}
            title={playing ? "Pause" : "Play"}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.06)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            <i className={`bi ${playing ? "bi-pause-fill" : "bi-play-fill"}`} style={{ marginLeft: playing ? 0 : 2 }}></i>
          </button>
          <button
            className="btn"
            style={{ 
              width: 32,
              height: 32,
              padding: 0,
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              transition: "all 0.15s ease",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Next"
            onClick={() => (shuffle ? playRandom() : playNext())}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-color)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="bi bi-skip-end-fill"></i>
          </button>
          <button
            className="btn"
            style={{ 
              width: 32,
              height: 32,
              padding: 0,
              background: "transparent",
              color: repeat ? "#1db954" : "var(--text-muted)",
              border: "none",
              transition: "all 0.15s ease",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => setRepeat((r) => !r)}
            title="Repeat"
            onMouseEnter={(e) => {
              if (!repeat) e.currentTarget.style.color = "var(--text-color)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              if (!repeat) e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="bi bi-repeat"></i>
          </button>
        </div>
        {/* Timeline */}
        <div className="d-flex align-items-center w-100" style={{ gap: 8 }}>
          <span style={{ fontSize: 11, minWidth: 40, color: "var(--text-muted)", textAlign: "right" }}>{formatTime(current)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={current}
            onChange={(e) => {
              setCurrent(Number(e.target.value));
              setCurrentTime(Number(e.target.value));
              if (audioRef.current) audioRef.current.currentTime = Number(e.target.value);
            }}
            className="music-timeline"
            style={{ 
              flex: 1,
              background: `linear-gradient(to right, #1db954 0%, #1db954 ${duration > 0 ? (current / duration) * 100 : 0}%, rgba(255,255,255,0.3) ${duration > 0 ? (current / duration) * 100 : 0}%, rgba(255,255,255,0.3) 100%)`
            }}
          />
          <span style={{ fontSize: 11, minWidth: 40, color: "var(--text-muted)" }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div 
        className="d-flex align-items-center justify-content-end" 
        style={{ 
          gap: 8,
          minWidth: 180
        }}
      >
        {user && (
          <button 
            className="btn" 
            style={{ 
              width: 32,
              height: 32,
              padding: 0,
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              transition: "all 0.15s ease",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }} 
            title="Add to playlist"
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-color)";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-muted)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <i className="bi bi-plus-square"></i>
          </button>
        )}
        <div className="d-flex align-items-center" style={{ gap: 8 }}>
          <button
            className="btn"
            style={{ 
              width: 32,
              height: 32,
              padding: 0,
              background: "transparent",
              color: "var(--text-muted)",
              border: "none",
              transition: "all 0.15s ease",
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            title="Volume"
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-color)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-muted)"}
          >
            <i className={`bi bi-volume-${volume > 50 ? 'up' : volume > 0 ? 'down' : 'mute'}-fill`}></i>
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => updateSetting('audio', 'volume', Number(e.target.value))}
            className="volume-slider"
            style={{ 
              width: 93,
              background: `linear-gradient(to right, #1db954 0%, #1db954 ${volume}%, rgba(255,255,255,0.3) ${volume}%, rgba(255,255,255,0.3) 100%)`
            }}
          />
        </div>
      </div>

      {/* Audio element */}
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        autoPlay={playing}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(Math.floor(audioRef.current.duration))}
        onEnded={() => {
          if (repeat) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
          } else if (shuffle) {
            playRandom();
          } else {
            playNext();
          }
        }}
      />
    </div>
  );
}

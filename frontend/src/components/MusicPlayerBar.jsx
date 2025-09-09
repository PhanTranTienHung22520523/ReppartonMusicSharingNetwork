import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAuth } from "../contexts/AuthContext";
import { useSettings } from "../contexts/SettingsContext";
import { useNavigate } from "react-router-dom";
import { useRef, useState, useEffect } from "react";

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
      className="music-player-bar d-flex align-items-center justify-content-between px-4 bg-white shadow-lg"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        height: 80,
        zIndex: 999,
        userSelect: "none",
        minWidth: 900
      }}
    >
      {/* Cover + info */}
      <div
        className="d-flex align-items-center"
        style={{ 
          cursor: "pointer", 
          minWidth: 250,
          maxWidth: 250,
          width: 250,
          overflow: "hidden"
        }}
        onClick={() => navigate("/listen")}
      >
        <img
          src={currentSong.coverUrl}
          alt="cover"
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            objectFit: "cover",
            marginRight: 16,
            flexShrink: 0
          }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="fw-bold text-truncate"
            style={{ color: "#6f42c1" }}
          >
            {currentSong.title}
          </div>
          <div
            className="text-muted text-truncate"
            style={{ fontSize: 14 }}
          >
            {currentSong.artist?.username || currentSong.artistName}
          </div>
        </div>
      </div>

      {/* Player controls */}
      <div 
        className="d-flex flex-column align-items-center" 
        style={{ 
          minWidth: 400,
          maxWidth: 400,
          width: 400
        }}
      >
        <div className="d-flex align-items-center gap-2 mb-1">
          <button
            className={`btn btn-light btn-sm ${shuffle ? "text-primary" : ""}`}
            style={{ borderRadius: "50%" }}
            onClick={() => setShuffle((s) => !s)}
            title="Shuffle"
          >
            <i className="bi bi-shuffle"></i>
          </button>
          <button
            className="btn btn-light btn-sm"
            style={{ borderRadius: "50%" }}
            title="Previous"
            onClick={playPrev}
          >
            <i className="bi bi-skip-start-fill"></i>
          </button>
          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: "50%", width: 40, height: 40, fontSize: 20 }}
            onClick={() => setPlaying((p) => !p)}
            title={playing ? "Pause" : "Play"}
          >
            <i className={`bi ${playing ? "bi-pause-fill" : "bi-play-fill"}`}></i>
          </button>
          <button
            className="btn btn-light btn-sm"
            style={{ borderRadius: "50%" }}
            title="Next"
            onClick={() => (shuffle ? playRandom() : playNext())}
          >
            <i className="bi bi-skip-end-fill"></i>
          </button>
          <button
            className={`btn btn-light btn-sm ${repeat ? "text-primary" : ""}`}
            style={{ borderRadius: "50%" }}
            onClick={() => setRepeat((r) => !r)}
            title="Repeat"
          >
            <i className="bi bi-repeat"></i>
          </button>
        </div>
        {/* Timeline */}
        <div className="d-flex align-items-center w-100" style={{ gap: 8 }}>
          <span style={{ fontSize: 14, minWidth: 40 }}>{formatTime(current)}</span>
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
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 14, minWidth: 40 }}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Like, share, playlist, volume */}
      <div 
        className="d-flex align-items-center gap-2" 
        style={{ 
          minWidth: 250,
          maxWidth: 250,
          width: 250,
          justifyContent: "flex-end"
        }}
      >
        {user && (
          <button
            className={`btn btn-light btn-sm ${liked ? "text-danger" : ""}`}
            style={{ borderRadius: "50%" }}
            onClick={() => setLiked((l) => !l)}
            title="Yêu thích"
          >
            <i className={`bi ${liked ? "bi-heart-fill" : "bi-heart"}`}></i>
          </button>
        )}
        <button className="btn btn-light btn-sm" style={{ borderRadius: "50%" }} title="Chia sẻ">
          <i className="bi bi-share"></i>
        </button>
        {user && (
          <button className="btn btn-light btn-sm" style={{ borderRadius: "50%" }} title="Thêm vào playlist">
            <i className="bi bi-music-note-list"></i>
          </button>
        )}
        <i className="bi bi-volume-up ms-2 me-1"></i>
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => updateSetting('audio', 'volume', Number(e.target.value))}
          style={{ width: 80 }}
        />
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

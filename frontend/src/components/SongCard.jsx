import { useState } from "react";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useAuth } from "../contexts/AuthContext";
import { 
  FaPlay, 
  FaPause, 
  FaHeart, 
  FaRegHeart, 
  FaEllipsisH,
  FaDownload,
  FaShare,
  FaPlus,
  FaHeadphones,
  FaClock,
  FaCheckCircle
} from "react-icons/fa";
import { toggleSongLike } from "../api/socialService";
import AddToPlaylistModal from "./AddToPlaylistModal";

export default function SongCard({ song, compact = false, showArtist = true }) {
  const { currentSong, playing, setCurrentSong, setPlaying } = useMusicPlayer();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(song.isLiked || false);
  const [likesCount, setLikesCount] = useState(song.likesCount || 0);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  
  const isCurrentSong = currentSong?.id === song.id;
  const showPlayButton = isCurrentSong && playing;

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (isCurrentSong) {
      setPlaying(!playing);
    } else {
      setCurrentSong(song);
      setPlaying(true);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      await toggleSongLike(song.id);
    } catch (error) {
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error("Failed to toggle like:", error);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPlays = (plays) => {
    if (!plays) return "0";
    if (plays < 1000) return plays.toString();
    if (plays < 1000000) return `${(plays / 1000).toFixed(1)}K`;
    return `${(plays / 1000000).toFixed(1)}M`;
  };

  if (compact) {
    return (
      <div 
        className="d-flex align-items-center gap-3 p-2 rounded hover-lift"
        style={{ cursor: 'pointer' }}
        onClick={() => setCurrentSong(song)}
      >
        <div className="position-relative">
          <img
            src={song.coverUrl || "/default-cover.png"}
            alt={song.title}
            className="rounded"
            width={48}
            height={48}
            style={{ objectFit: "cover" }}
          />
          <button
            className={`btn btn-primary rounded-circle position-absolute top-50 start-50 translate-middle p-1 ${
              isCurrentSong ? 'opacity-100' : 'opacity-0'
            }`}
            style={{ 
              width: 24, 
              height: 24,
              transition: 'var(--transition-fast)'
            }}
            onClick={handlePlayPause}
          >
            {showPlayButton ? (
              <FaPause size={8} />
            ) : (
              <FaPlay size={8} style={{ marginLeft: 1 }} />
            )}
          </button>
        </div>
        
        <div className="flex-grow-1" style={{ minWidth: 0 }}>
          <div className="fw-medium text-truncate" style={{ fontSize: 14 }}>
            {song.title}
          </div>
          {showArtist && (
            <div className="text-muted-custom text-truncate" style={{ fontSize: 12 }}>
              {song.artist?.name || song.artistName}
            </div>
          )}
        </div>
        
        <div className="d-flex align-items-center gap-2">
          {user && (
            <button
              className={`btn btn-ghost p-1 ${isLiked ? 'text-danger' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? <FaHeart size={12} /> : <FaRegHeart size={12} />}
            </button>
          )}
          <span className="text-muted-custom" style={{ fontSize: 11 }}>
            {formatDuration(song.duration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="music-card position-relative"
      style={{
        borderRadius: "var(--border-radius-lg)",
        overflow: "hidden",
        cursor: "pointer",
        background: "var(--card-color)",
        border: `2px solid ${isCurrentSong ? 'var(--primary-color)' : 'var(--border-color)'}`,
      }}
      onClick={() => setCurrentSong(song)}
    >
      {/* Cover Image */}
      <div className="position-relative">
        <img
          src={song.coverUrl || "/default-cover.png"}
          alt={song.title}
          className="w-100"
          style={{
            height: 200,
            objectFit: "cover",
            transition: "var(--transition-medium)",
          }}
        />
        
        {/* Play Button Overlay */}
        <button
          className="play-button position-absolute"
          onClick={handlePlayPause}
          title={showPlayButton ? "Pause" : "Play"}
        >
          {showPlayButton ? (
            <FaPause size={18} />
          ) : (
            <FaPlay size={18} style={{ marginLeft: 2 }} />
          )}
        </button>

        {/* Quick Actions */}
        <div className="position-absolute top-0 end-0 p-2">
          <div className="d-flex flex-column gap-1">
            {user && (
              <button
                className={`btn btn-ghost rounded-circle p-2 ${isLiked ? 'text-danger' : ''}`}
                onClick={handleLike}
                title={isLiked ? "Unlike" : "Like"}
                style={{ background: 'rgba(0,0,0,0.6)' }}
              >
                {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
              </button>
            )}
            
            <div className="dropdown">
              <button 
                className="btn btn-ghost rounded-circle p-2"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ background: 'rgba(0,0,0,0.6)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <FaEllipsisH size={12} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                {user && (
                  <li>
                    <button 
                      className="dropdown-item d-flex align-items-center gap-2" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddToPlaylist(true);
                      }}
                    >
                      <FaPlus size={12} />
                      Add to Playlist
                    </button>
                  </li>
                )}
                <li>
                  <a className="dropdown-item d-flex align-items-center gap-2" href="#">
                    <FaDownload size={12} />
                    Download
                  </a>
                </li>
                <li>
                  <a className="dropdown-item d-flex align-items-center gap-2" href="#">
                    <FaShare size={12} />
                    Share
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Now Playing Indicator */}
        {isCurrentSong && (
          <div 
            className="position-absolute bottom-0 start-0 w-100"
            style={{
              height: 3,
              background: "var(--primary-color)",
              animation: playing ? "pulse 2s infinite" : "none"
            }}
          />
        )}
      </div>

      {/* Song Info */}
      <div className="p-3">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h6 className="fw-bold mb-1 text-truncate text-primary">
              {song.title}
            </h6>
            {showArtist && (
              <div className="d-flex align-items-center gap-1 mb-2">
                <span className="text-secondary-custom text-truncate">
                  {song.artist?.name || song.artistName}
                </span>
                {song.artist?.verified && (
                  <FaCheckCircle 
                    className="text-primary-custom" 
                    size={12}
                    title="Verified Artist"
                  />
                )}
              </div>
            )}
          </div>
          
          {likesCount > 0 && (
            <div className="text-muted-custom d-flex align-items-center gap-1">
              <FaHeart size={12} />
              <span style={{ fontSize: 11 }}>
                {formatPlays(likesCount)}
              </span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="d-flex align-items-center justify-content-between text-muted-custom">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1">
              <FaHeadphones size={12} />
              <span style={{ fontSize: 11 }}>
                {formatPlays(song.plays || song.views || 0)}
              </span>
            </div>
            
            <div className="d-flex align-items-center gap-1">
              <FaClock size={12} />
              <span style={{ fontSize: 11 }}>
                {formatDuration(song.duration) || song.durationText || "0:00"}
              </span>
            </div>
          </div>
          
          {song.genre && (
            <span 
              className="badge"
              style={{
                background: 'var(--primary-color)',
                color: 'white',
                fontSize: 10,
                padding: '2px 6px'
              }}
            >
              {song.genre}
            </span>
          )}
        </div>
      </div>

      {/* Add To Playlist Modal */}
      <AddToPlaylistModal
        show={showAddToPlaylist}
        onClose={() => setShowAddToPlaylist(false)}
        song={song}
      />
    </div>
  );
}
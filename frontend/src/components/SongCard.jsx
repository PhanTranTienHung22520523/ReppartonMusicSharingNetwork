import { useEffect, useState } from "react";
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
  FaFlag,
  FaHeadphones,
  FaClock,
  FaCheckCircle,
  FaEdit,
  FaTrash
} from "react-icons/fa";
import ReportModal from "./ReportModal";
import { checkSongLike, getLikesCount, toggleSongLike } from "../api/socialService";
import AddToPlaylistModal from "./AddToPlaylistModal";
import ConfirmModal from "./ConfirmModal";
import EditSongModal from "./EditSongModal";
import { updateSong, deleteSong } from "../api/songService";
import ArtistName from "./ArtistName";
import { fetchDurationFromUrl, formatDuration as formatDur } from "../utils/songUtils";

export default function SongCard({ song: initialSong, compact = false, showArtist = true, onUpdate, onDelete, isOwner: explicitIsOwner }) {
  // Normalize song object to ensure it has an id field
  const normalizedInitialSong = initialSong ? {
    ...initialSong,
    id: initialSong.id || initialSong._id || initialSong._idstr
  } : null;

  const [song, setSong] = useState(normalizedInitialSong);
  const { currentSong, playing, setCurrentSong, setPlaying } = useMusicPlayer();
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(song?.isLiked || false);
  const [likesCount, setLikesCount] = useState(song?.likesCount || 0);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [dynamicDuration, setDynamicDuration] = useState(null);

  // Sync internal state if initialSong changes
  useEffect(() => {
    if (initialSong) {
      setSong({
        ...initialSong,
        id: initialSong.id || initialSong._id || initialSong._idstr
      });
    }
  }, [initialSong]);

  const isOwner = explicitIsOwner || (user && song && (
    String(song.artistId) === String(user.id) ||
    String(song.userId) === String(user.id) ||
    (song.artist && typeof song.artist === 'object' ? String(song.artist.id || song.artist._id) === String(user.id) : String(song.artist) === String(user.id)) ||
    (song.artistName && user.fullName === song.artistName)
  ));

  useEffect(() => {
    if (!song?.id) return;

    let cancelled = false;
    const hydrate = async () => {
      try {
        const [count, likedRes] = await Promise.all([
          getLikesCount(song.id, 'SONG'),
          user ? checkSongLike(song.id) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        if (typeof count === 'number') setLikesCount(count);
        if (likedRes && typeof likedRes?.liked === 'boolean') setIsLiked(likedRes.liked);
      } catch {
        // best-effort
      }
    };

    hydrate();
    return () => { cancelled = true; };
  }, [song?.id, user]);

  // Dynamically load duration from Cloudinary URL if missing
  useEffect(() => {
    if (!song?.duration && song?.fileUrl && !dynamicDuration) {
      fetchDurationFromUrl(song.fileUrl).then(dur => {
        if (dur) setDynamicDuration(dur);
      });
    }
  }, [song?.fileUrl, song?.duration]);

  const handlePlayPause = (e) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      setPlaying(!playing);
    } else {
      setCurrentSong(song);
      setPlaying(true);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;

    const originalLiked = isLiked;
    const originalCount = likesCount;

    setIsLiked(!originalLiked);
    setLikesCount(prev => originalLiked ? prev - 1 : prev + 1);

    try {
      const res = await toggleSongLike(song.id);
      if (res && typeof res.liked === 'boolean') {
        setIsLiked(res.liked);
        // Sync with count from server if possible, otherwise use local logic
        const newCount = await getLikesCount(song.id, 'SONG');
        if (typeof newCount === 'number') setLikesCount(newCount);
      }
    } catch (error) {
      setIsLiked(originalLiked);
      setLikesCount(originalCount);
    }
  };

  const formatDuration = (seconds) => {
    return formatDur(seconds);
  };

  const formatPlays = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const isCurrentSong = currentSong?.id === song.id;
  const showPlayButton = isCurrentSong && playing;

  const [imgHasError, setImgHasError] = useState(false);
  const coverUrl = !imgHasError && (song.coverImageUrl || song.coverImage || song.imageUrl || song.cover)
    ? (song.coverImageUrl || song.coverImage || song.imageUrl || song.cover)
    : "/1.png";

  if (compact) {
    return (
      <div
        className={`d-flex align-items-center gap-3 p-2 rounded-3 hover-bg glass-light ${isCurrentSong ? 'border-start border-4 border-primary' : ''}`}
        style={{ cursor: 'pointer', transition: 'var(--transition-fast)' }}
        onClick={() => setCurrentSong(song)}
      >
        <div className="position-relative" style={{ width: 40, height: 40, flexShrink: 0 }}>
          <img
            src={coverUrl || "/default-cover.png"}
            className="w-100 h-100 rounded-2 shadow-sm"
            style={{ objectFit: 'cover' }}
            alt=""
          />
          <button
            className="position-absolute top-50 start-50 translate-middle btn btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center"
            style={{ width: 20, height: 20, opacity: isCurrentSong ? 1 : 0 }}
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
            <ArtistName
              userId={song.artist}
              initialName={song.artistName || (song.artist && typeof song.artist === 'object' ? song.artist?.name : null)}
              className="text-muted-custom text-truncate d-block"
              style={{ fontSize: 12 }}
            />
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
            {formatDuration(song.duration || dynamicDuration)}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="music-card position-relative glass-medium hover-depth-lift"
      style={{
        borderRadius: "var(--border-radius-lg)",
        cursor: "pointer",
        background: "var(--glass-bg)",
        border: `2px solid ${isCurrentSong ? 'var(--primary-color)' : 'transparent'}`,
        boxShadow: isCurrentSong ? 'var(--depth-purple)' : 'var(--depth-md)',
        overflow: 'visible'
      }}
      onClick={() => setCurrentSong(song)}
    >
      {/* Cover Image Container */}
      <div className="position-relative" style={{ overflow: 'hidden', borderTopLeftRadius: 'inherit', borderTopRightRadius: 'inherit', height: 200, background: 'rgba(0,0,0,0.05)' }}>
        <img
          src={coverUrl}
          alt={song.title}
          className="w-100 h-100"
          style={{
            objectFit: "cover",
            transition: "opacity 0.3s ease",
          }}
          onError={() => setImgHasError(true)}
        />

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

      <div className="p-3">
        <div className="d-flex align-items-start justify-content-between mb-2">
          <div style={{ minWidth: 0, flex: 1 }}>
            <h6 className="fw-bold mb-1 text-truncate text-primary">
              {song.title}
            </h6>
            {showArtist && (
              <div className="d-flex align-items-center gap-1 mb-2">
                <ArtistName
                  userId={song.artist}
                  initialName={song.artistName || (song.artist && typeof song.artist === 'object' ? song.artist?.name : null)}
                  className="text-secondary-custom text-truncate"
                />
                {song.artist?.verified && (
                  <FaCheckCircle className="text-primary-custom" size={12} title="Verified Artist" />
                )}
              </div>
            )}
          </div>

          {likesCount > 0 && (
            <div className="text-muted-custom d-flex align-items-center gap-1">
              <FaHeart size={12} />
              <span style={{ fontSize: 11 }}>{formatPlays(likesCount)}</span>
            </div>
          )}
        </div>

        <div className="d-flex align-items-center justify-content-between text-muted-custom">
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-1">
              <FaHeadphones size={12} />
              <span style={{ fontSize: 11 }}>{formatPlays(song.playsCount || 0)}</span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <FaClock size={12} />
              <span style={{ fontSize: 11 }}>{formatDuration(song.duration || dynamicDuration) || "0:00"}</span>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2" onClick={(e) => e.stopPropagation()}>
            {user && (
              <button
                className={`btn btn-ghost rounded-circle p-2 ${isLiked ? 'text-danger' : ''}`}
                onClick={handleLike}
                title={isLiked ? "Unlike" : "Like"}
              >
                {isLiked ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
              </button>
            )}

            <div className="dropdown">
              <button
                className="btn btn-ghost rounded-circle p-2"
                data-bs-toggle="dropdown"
                onClick={(e) => e.stopPropagation()}
              >
                <FaEllipsisH size={12} />
              </button>
              <ul className="dropdown-menu dropdown-menu-end" style={{ zIndex: 1060 }}>
                {user && (
                  <li>
                    <button className="dropdown-item d-flex align-items-center gap-2" onClick={(e) => { e.stopPropagation(); setShowAddToPlaylist(true); }}>
                      <FaPlus size={12} /> Add to Playlist
                    </button>
                  </li>
                )}
                <li><a className="dropdown-item d-flex align-items-center gap-2" href="#" onClick={e => e.preventDefault()}><FaDownload size={12} /> Download</a></li>
                <li><a className="dropdown-item d-flex align-items-center gap-2" href="#" onClick={e => e.preventDefault()}><FaShare size={12} /> Share</a></li>
                <li>
                  <button className="dropdown-item d-flex align-items-center gap-2" onClick={(e) => { e.stopPropagation(); setShowReportModal(true); }}>
                    <FaFlag size={12} /> Report Song
                  </button>
                </li>
                {isOwner && (
                  <>
                    <hr className="dropdown-divider" />
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2" onClick={(e) => { e.stopPropagation(); setShowEditModal(true); }}>
                        <FaEdit size={12} /> Edit Song
                      </button>
                    </li>
                    <li>
                      <button className="dropdown-item d-flex align-items-center gap-2 text-danger" onClick={(e) => { e.stopPropagation(); setShowConfirmDelete(true); }}>
                        <FaTrash size={12} /> Delete Song
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <AddToPlaylistModal show={showAddToPlaylist} onClose={() => setShowAddToPlaylist(false)} song={song} />
      <ReportModal show={showReportModal} onClose={() => setShowReportModal(false)} itemType="SONG" itemId={song.id} onReported={() => setShowReportModal(false)} />
      <EditSongModal show={showEditModal} song={song} saving={isSaving} onClose={() => setShowEditModal(false)} onSave={async (formData) => {
        setIsSaving(true);
        try {
          const data = new FormData();
          data.append('title', formData.title);
          data.append('description', formData.description);
          data.append('lyrics', formData.lyrics);
          const updated = await updateSong(song.id, data);
          const newData = updated.data || updated;
          setSong(prev => ({ ...prev, ...newData }));
          setShowEditModal(false);
          if (onUpdate) onUpdate(newData);
          setFlashMessage('Song updated successfully');
          setTimeout(() => setFlashMessage(''), 3000);
        } catch (error) {
          alert("Update failed: " + error.message);
        } finally {
          setIsSaving(false);
        }
      }} />
      <ConfirmModal show={showConfirmDelete} title="Delete Song" message={`Are you sure?`} confirmText="Delete" confirmVariant="danger" loading={isDeleting} onClose={() => setShowConfirmDelete(false)} onConfirm={async () => {
        setIsDeleting(true);
        try {
          await deleteSong(song.id);
          setShowConfirmDelete(false);
          if (onDelete) onDelete(song.id);
        } catch (error) {
          alert("Delete failed: " + error.message);
        } finally {
          setIsDeleting(false);
        }
      }} />

      {flashMessage && (
        <div style={{ position: 'absolute', bottom: 12, left: 12, right: 12, zIndex: 100 }}>
          <div className="alert alert-success py-1 px-2 m-0 small shadow-sm text-center">{flashMessage}</div>
        </div>
      )}
    </div>
  );
}
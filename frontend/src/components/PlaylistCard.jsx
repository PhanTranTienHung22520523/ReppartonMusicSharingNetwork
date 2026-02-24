import { Link } from 'react-router-dom';
import { FaPlay, FaMusic, FaLock, FaGlobe, FaEllipsisH, FaEdit, FaTrash, FaHeart, FaShare } from 'react-icons/fa';
import UserAvatar from './UserAvatar';

export default function PlaylistCard({ playlist, currentUser, isOwner = false, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const coerceBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
      return undefined;
    }
    if (typeof value === 'string') {
      const v = value.trim().toLowerCase();
      if (v === 'true') return true;
      if (v === 'false') return false;
    }
    return undefined;
  };

  const isPrivateValue = coerceBoolean(playlist?.isPrivate);
  const isPublicValue = coerceBoolean(playlist?.isPublic);
  // Prefer isPrivate from backend when present; otherwise fall back to isPublic
  const isPublic =
    typeof isPrivateValue === 'boolean'
      ? !isPrivateValue
      : (typeof isPublicValue === 'boolean' ? isPublicValue : false);

  const songCount =
    (typeof playlist?.songCount === 'number' ? playlist.songCount : undefined) ??
    (Array.isArray(playlist?.songs) ? playlist.songs.length : undefined) ??
    (Array.isArray(playlist?.songIds) ? playlist.songIds.length : undefined) ??
    (Array.isArray(playlist?.songIdList) ? playlist.songIdList.length : undefined) ??
    0;

  const displayUser = playlist?.user || currentUser;

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(playlist);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(playlist);
  };

  return (
    <div className="playlist-card">
      <Link to={`/playlist/${playlist.id}`} className="text-decoration-none">
        <div className="card glass-medium border-0 hover-depth-lift shimmer h-100" style={{ borderRadius: 'var(--border-radius-lg)', transition: 'all var(--transition-medium)', boxShadow: 'var(--depth-md)' }}>
          {/* Playlist Cover */}
          <div className="position-relative gradient-overlay-purple" style={{ height: '200px', background: 'var(--gradient-purple)', boxShadow: 'var(--depth-purple)' }}>
            <div className="position-absolute top-50 start-50 translate-middle text-center float-element">
              <FaMusic size={48} className="text-white mb-2" style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }} />
              <div className="text-white small fw-medium" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>{songCount} Songs</div>
            </div>
            
            {/* Play Button */}
            <button 
              className="btn btn-success rounded-circle position-absolute"
              style={{ 
                bottom: '15px', 
                right: '15px',
                width: '50px',
                height: '50px',
                opacity: 0,
                transition: 'opacity 0.3s ease'
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Handle play playlist
              }}
            >
              <FaPlay style={{ marginLeft: '2px' }} />
            </button>

            {/* Privacy Icon */}
            <div className="position-absolute top-2 start-2">
              <span className="badge bg-dark bg-opacity-75 text-white">
                {isPublic ? <FaGlobe size={12} /> : <FaLock size={12} />}
              </span>
            </div>

            {/* Actions Menu */}
            <div className="position-absolute top-2 end-2">
              <div className="dropdown">
                <button 
                  className="btn btn-sm btn-dark btn-opacity-75 border-0 rounded-circle"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <FaEllipsisH size={12} />
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item">
                      <FaPlay className="me-2" size={12} />
                      Play Now
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <FaHeart className="me-2" size={12} />
                      Like Playlist
                    </button>
                  </li>
                  <li>
                    <button className="dropdown-item">
                      <FaShare className="me-2" size={12} />
                      Share
                    </button>
                  </li>
                  {isOwner && (
                    <>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleEdit}>
                          <FaEdit className="me-2" size={12} />
                          Edit Playlist
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item text-danger" onClick={handleDelete}>
                          <FaTrash className="me-2" size={12} />
                          Delete
                        </button>
                      </li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Playlist Info */}
          <div className="card-body p-4">
            <h5 className="card-title mb-2 text-truncate text-dark">
              {playlist.name}
            </h5>
            
            {playlist.description && (
              <p className="text-muted mb-3" style={{ 
                fontSize: '0.9rem', 
                lineHeight: '1.4',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>
                {playlist.description}
              </p>
            )}

            {/* Stats */}
            <div className="d-flex align-items-center justify-content-between text-muted small mb-3">
              <span>
                <FaMusic className="me-1" size={10} />
                {songCount} songs
              </span>
              <span>
                Updated {formatDate(playlist.updatedAt || playlist.createdAt)}
              </span>
            </div>

            {/* Creator Info */}
            <div className="d-flex align-items-center">
              <UserAvatar 
                user={displayUser} 
                size={24} 
                className="me-2"
              />
              <div className="flex-grow-1 min-width-0">
                <div className="text-muted small text-truncate">
                  by {displayUser?.fullName || displayUser?.username || 'Unknown'}
                </div>
              </div>
              <div className="d-flex align-items-center text-muted small">
                {isPublic ? (
                  <>
                    <FaGlobe className="me-1" size={10} />
                    Public
                  </>
                ) : (
                  <>
                    <FaLock className="me-1" size={10} />
                    Private
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Link>

      <style jsx>{`
        .playlist-card .card:hover .btn {
          opacity: 1 !important;
        }
        .playlist-card .hover-lift:hover {
          transform: translateY(-8px);
        }
      `}</style>
    </div>
  );
}

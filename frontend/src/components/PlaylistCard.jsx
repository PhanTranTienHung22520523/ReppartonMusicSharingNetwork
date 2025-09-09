import { Link } from 'react-router-dom';
import { FaPlay, FaMusic, FaLock, FaGlobe, FaEllipsisH, FaEdit, FaTrash, FaHeart, FaShare } from 'react-icons/fa';
import UserAvatar from './UserAvatar';

export default function PlaylistCard({ playlist, isOwner = false, onEdit, onDelete }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

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
        <div className="card border-0 shadow-sm hover-lift h-100" style={{ borderRadius: '16px', transition: 'all 0.3s ease' }}>
          {/* Playlist Cover */}
          <div className="position-relative" style={{ height: '200px', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
            <div className="position-absolute top-50 start-50 translate-middle text-center">
              <FaMusic size={48} className="text-white mb-2 opacity-75" />
              <div className="text-white small fw-medium">{playlist.songCount || 0} Songs</div>
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
                {playlist.isPublic ? <FaGlobe size={12} /> : <FaLock size={12} />}
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
                {playlist.songCount || 0} songs
              </span>
              <span>
                Updated {formatDate(playlist.updatedAt || playlist.createdAt)}
              </span>
            </div>

            {/* Creator Info */}
            <div className="d-flex align-items-center">
              <UserAvatar 
                user={playlist.user} 
                size={24} 
                className="me-2"
              />
              <div className="flex-grow-1 min-width-0">
                <div className="text-muted small text-truncate">
                  by {playlist.user?.fullName || playlist.user?.username || 'Unknown'}
                </div>
              </div>
              <div className="d-flex align-items-center text-muted small">
                {playlist.isPublic ? (
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

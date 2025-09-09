import { useState, useEffect } from 'react';
import { FaPlus, FaCheck, FaMusic, FaSearch } from 'react-icons/fa';
import { getUserPlaylists, addSongToPlaylist } from '../api/playlistService';
import { useAuth } from '../contexts/AuthContext';

export default function AddToPlaylistModal({ show, onClose, song }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (show && user) {
      loadPlaylists();
    }
  }, [show, user]);

  const loadPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      const userPlaylists = await getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (error) {
      setError('Failed to load playlists');
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    if (!song) return;

    setAddingToPlaylist(playlistId);
    setError('');
    setSuccess('');

    try {
      await addSongToPlaylist(playlistId, song.id);
      const playlist = playlists.find(p => p.id === playlistId);
      setSuccess(`Added to "${playlist?.name || 'playlist'}" successfully!`);
      
      // Auto close after success
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setAddingToPlaylist(null);
    }
  };

  const handleClose = () => {
    setError('');
    setSuccess('');
    setSearchQuery('');
    onClose();
  };

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (playlist.description && playlist.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!show || !song) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title d-flex align-items-center">
              <FaPlus className="me-2 text-primary" />
              Add to Playlist
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
            ></button>
          </div>
          
          <div className="modal-body">
            {/* Song Info */}
            <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
              <div className="bg-primary rounded me-3 p-2">
                <FaMusic className="text-white" />
              </div>
              <div className="flex-grow-1">
                <h6 className="mb-1">{song.title}</h6>
                <p className="text-muted mb-0 small">
                  by {song.artistUsername || song.artist || 'Unknown Artist'}
                </p>
              </div>
            </div>

            {/* Search Playlists */}
            {playlists.length > 3 && (
              <div className="mb-3">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <FaSearch className="text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search playlists..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Error/Success Messages */}
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success d-flex align-items-center" role="alert">
                <FaCheck className="me-2" />
                {success}
              </div>
            )}

            {/* Playlists List */}
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading playlists...</span>
                </div>
                <div className="mt-2 text-muted">Loading your playlists...</div>
              </div>
            ) : filteredPlaylists.length === 0 ? (
              <div className="text-center py-4">
                <FaMusic size={32} className="text-muted mb-3" />
                <p className="text-muted">
                  {searchQuery ? 'No playlists found matching your search.' : 'You don\'t have any playlists yet.'}
                </p>
                {!searchQuery && (
                  <button 
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      // You might want to implement this to open create playlist modal
                      handleClose();
                    }}
                  >
                    <FaPlus className="me-1" />
                    Create Your First Playlist
                  </button>
                )}
              </div>
            ) : (
              <div className="playlist-list" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {filteredPlaylists.map((playlist) => (
                  <div 
                    key={playlist.id}
                    className="playlist-item d-flex align-items-center justify-content-between p-3 border rounded mb-2 hover-bg-light"
                    style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}
                    onClick={() => handleAddToPlaylist(playlist.id)}
                  >
                    <div className="d-flex align-items-center flex-grow-1">
                      <div className="bg-primary-subtle rounded me-3 p-2">
                        <FaMusic className="text-primary" />
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="mb-1">{playlist.name}</h6>
                        <p className="text-muted mb-0 small">
                          {playlist.songCount || 0} songs
                          {playlist.description && ` • ${playlist.description.substring(0, 50)}${playlist.description.length > 50 ? '...' : ''}`}
                        </p>
                      </div>
                    </div>
                    
                    <button 
                      className="btn btn-outline-primary btn-sm"
                      disabled={addingToPlaylist === playlist.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToPlaylist(playlist.id);
                      }}
                    >
                      {addingToPlaylist === playlist.id ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-1" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </span>
                          Adding...
                        </>
                      ) : (
                        <>
                          <FaPlus className="me-1" />
                          Add
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-0 pt-0">
            <button 
              type="button" 
              className="btn btn-outline-secondary"
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

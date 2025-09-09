import { useState } from 'react';
import { FaPlus, FaTimes, FaMusic, FaLock, FaGlobe } from 'react-icons/fa';
import { createPlaylist } from '../api/playlistService';

export default function CreatePlaylistModal({ show, onClose, onPlaylistCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Playlist name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newPlaylist = await createPlaylist(formData);
      onPlaylistCreated(newPlaylist);
      setFormData({ name: '', description: '', isPublic: true });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '', isPublic: true });
    setError('');
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title d-flex align-items-center">
              <FaMusic className="me-2 text-primary" />
              Create New Playlist
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              disabled={loading}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <FaTimes className="me-2" />
                  {error}
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="playlistName" className="form-label fw-medium">
                  Playlist Name *
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  id="playlistName"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter playlist name..."
                  required
                  disabled={loading}
                  maxLength={100}
                />
              </div>

              <div className="mb-3">
                <label htmlFor="playlistDescription" className="form-label fw-medium">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="playlistDescription"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your playlist..."
                  rows="3"
                  disabled={loading}
                  maxLength={500}
                ></textarea>
                <div className="form-text">
                  {formData.description.length}/500 characters
                </div>
              </div>

              <div className="mb-3">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="isPublic"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  <label className="form-check-label d-flex align-items-center" htmlFor="isPublic">
                    {formData.isPublic ? (
                      <>
                        <FaGlobe className="me-2 text-success" />
                        Public Playlist
                      </>
                    ) : (
                      <>
                        <FaLock className="me-2 text-warning" />
                        Private Playlist
                      </>
                    )}
                  </label>
                  <div className="form-text">
                    {formData.isPublic 
                      ? 'Anyone can discover and listen to this playlist'
                      : 'Only you can see and play this playlist'
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer border-0 pt-0">
              <button 
                type="button" 
                className="btn btn-outline-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary d-flex align-items-center"
                disabled={loading || !formData.name.trim()}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </span>
                    Creating...
                  </>
                ) : (
                  <>
                    <FaPlus className="me-2" />
                    Create Playlist
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { FaEdit, FaTimes, FaMusic, FaLock, FaGlobe, FaTrash } from 'react-icons/fa';
import { updatePlaylist, deletePlaylist } from '../api/playlistService';

export default function EditPlaylistModal({ show, onClose, playlist, onPlaylistUpdated, onPlaylistDeleted }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (playlist) {
      setFormData({
        name: playlist.name || '',
        description: playlist.description || '',
        isPublic: playlist.isPublic !== false
      });
    }
  }, [playlist]);

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
      const updatedPlaylist = await updatePlaylist(playlist.id, formData);
      onPlaylistUpdated(updatedPlaylist);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError('');

    try {
      await deletePlaylist(playlist.id);
      onPlaylistDeleted(playlist.id);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleClose = () => {
    setError('');
    setShowDeleteConfirm(false);
    onClose();
  };

  if (!show || !playlist) return null;

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '20px' }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title d-flex align-items-center">
              <FaEdit className="me-2 text-primary" />
              Edit Playlist
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={handleClose}
              disabled={loading || deleting}
            ></button>
          </div>
          
          {!showDeleteConfirm ? (
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FaTimes className="me-2" />
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label htmlFor="editPlaylistName" className="form-label fw-medium">
                    Playlist Name *
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="editPlaylistName"
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
                  <label htmlFor="editPlaylistDescription" className="form-label fw-medium">
                    Description
                  </label>
                  <textarea
                    className="form-control"
                    id="editPlaylistDescription"
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
                      id="editIsPublic"
                      name="isPublic"
                      checked={formData.isPublic}
                      onChange={handleInputChange}
                      disabled={loading}
                    />
                    <label className="form-check-label d-flex align-items-center" htmlFor="editIsPublic">
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
                  </div>
                </div>

                {/* Danger Zone */}
                <div className="border-top pt-3 mt-4">
                  <h6 className="text-danger mb-2">Danger Zone</h6>
                  <p className="text-muted small mb-3">
                    Once you delete a playlist, there is no going back. Please be certain.
                  </p>
                  <button 
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={loading}
                  >
                    <FaTrash className="me-1" />
                    Delete Playlist
                  </button>
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <FaEdit className="me-2" />
                      Update Playlist
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="modal-body text-center">
                <div className="mb-4">
                  <FaTrash size={48} className="text-danger mb-3" />
                  <h5>Delete Playlist</h5>
                  <p className="text-muted">
                    Are you sure you want to delete "<strong>{playlist.name}</strong>"?<br/>
                    This action cannot be undone.
                  </p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}
              </div>

              <div className="modal-footer border-0">
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger d-flex align-items-center"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </span>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <FaTrash className="me-2" />
                      Delete Permanently
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

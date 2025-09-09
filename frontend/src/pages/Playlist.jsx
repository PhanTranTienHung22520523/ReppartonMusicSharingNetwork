import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getUserPlaylists } from "../api/playlistService";
import { FaPlus, FaMusic, FaPlay, FaLock, FaGlobe, FaEllipsisH, FaEdit, FaTrash, FaHeart } from "react-icons/fa";
import MainLayout from "../components/MainLayout";
import CreatePlaylistModal from "../components/CreatePlaylistModal";
import EditPlaylistModal from "../components/EditPlaylistModal";
import PlaylistCard from "../components/PlaylistCard";

export default function Playlist() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);

  useEffect(() => {
    console.log("User in Playlist component:", user);
    if (!user) return;
    loadPlaylists();
  }, [user]);

  const loadPlaylists = async () => {
    setLoading(true);
    setError('');
    try {
      console.log("Loading playlists for user:", user);
      const userPlaylists = await getUserPlaylists();
      console.log("Loaded playlists:", userPlaylists);
      setPlaylists(userPlaylists);
    } catch (err) {
      console.error('Failed to load playlists:', err);
      setError('Failed to load playlists');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistCreated = (newPlaylist) => {
    setPlaylists(prev => [newPlaylist, ...prev]);
  };

  const handlePlaylistUpdated = (updatedPlaylist) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist.id === updatedPlaylist.id ? { ...playlist, ...updatedPlaylist } : playlist
      )
    );
    setSelectedPlaylist(null);
  };

  const handlePlaylistDeleted = (playlistId) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
    setSelectedPlaylist(null);
  };

  const handleEditPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowEditModal(true);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <FaMusic size={64} className="text-muted mb-3" />
          <h4>Sign in to view your playlists</h4>
          <p className="text-muted mb-4">Create and manage your personal music collections</p>
          <Link to="/login" className="btn btn-primary">
            Sign In
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="fw-bold mb-1">Your Playlists</h2>
                <p className="text-muted mb-0">
                  Manage your personal music collections
                </p>
              </div>
              <button 
                className="btn btn-primary d-flex align-items-center"
                onClick={() => setShowCreateModal(true)}
              >
                <FaPlus className="me-2" />
                Create Playlist
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <div className="text-muted">Loading your playlists...</div>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {playlists.length === 0 ? (
              <div className="text-center py-5">
                <FaMusic size={64} className="text-muted mb-4" />
                <h4 className="mb-3">No playlists yet</h4>
                <p className="text-muted mb-4">
                  Create your first playlist to organize your favorite songs
                </p>
                <button 
                  className="btn btn-primary btn-lg"
                  onClick={() => setShowCreateModal(true)}
                >
                  <FaPlus className="me-2" />
                  Create Your First Playlist
                </button>
              </div>
            ) : (
              /* Playlists Grid */
              <div className="row g-4">
                {playlists.map(playlist => (
                  <div className="col-lg-4 col-md-6" key={playlist.id}>
                    <PlaylistCard
                      playlist={playlist}
                      isOwner={true}
                      onEdit={handleEditPlaylist}
                      onDelete={(playlist) => {
                        if (window.confirm(`Are you sure you want to delete "${playlist.name}"?`)) {
                          // Handle delete - this will be implemented in the edit modal
                          handleEditPlaylist(playlist);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreatePlaylistModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPlaylistCreated={handlePlaylistCreated}
      />

      <EditPlaylistModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={selectedPlaylist}
        onPlaylistUpdated={handlePlaylistUpdated}
        onPlaylistDeleted={handlePlaylistDeleted}
      />
    </MainLayout>
  );
}
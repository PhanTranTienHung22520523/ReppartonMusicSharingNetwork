import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaShare, FaEllipsisH, FaTrash, FaEdit, FaMusic, FaClock, FaUser } from 'react-icons/fa';
import { getPlaylistById, removeSongFromPlaylist } from '../api/playlistService';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../components/MainLayout';
import UserAvatar from '../components/UserAvatar';
import EditPlaylistModal from '../components/EditPlaylistModal';
import PlaylistComments from '../components/PlaylistComments';

export default function PlaylistDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentSong, setCurrentSong, setPlaying, setPlaylist: setPlayerPlaylist } = useMusicPlayer();
  
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [removingSong, setRemovingSong] = useState(null);

  const loadPlaylist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const playlistData = await getPlaylistById(id);
      setPlaylist(playlistData);
    } catch (err) {
      setError('Failed to load playlist');
      console.error('Failed to load playlist:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPlaylist();
  }, [loadPlaylist]);

  const handlePlayPlaylist = () => {
    if (!playlist?.songs?.length) return;
    
    const firstSong = playlist.songs[0];
    setCurrentSong(firstSong);
    setPlayerPlaylist(playlist.songs);
    setPlaying(true);
  };

  const handlePlaySong = (song, index) => {
    setCurrentSong(song);
    setPlayerPlaylist(playlist.songs.slice(index)); // Start from selected song
    setPlaying(true);
  };

  const handleRemoveSong = async (songId) => {
    if (!user || !playlist || !(
      (playlist.user?.id === user.id) || 
      (playlist.userId === user.id)
    )) return;

    setRemovingSong(songId);
    try {
      await removeSongFromPlaylist(playlist.id, songId);
      setPlaylist(prev => ({
        ...prev,
        songs: prev.songs.filter(song => song.id !== songId),
        songCount: prev.songCount - 1
      }));
    } catch (err) {
      console.error('Failed to remove song:', err);
      alert('Failed to remove song from playlist');
    } finally {
      setRemovingSong(null);
    }
  };

  const handlePlaylistUpdated = (updatedPlaylist) => {
    setPlaylist(prev => ({ ...prev, ...updatedPlaylist }));
  };

  const handlePlaylistDeleted = () => {
    navigate('/playlist');
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTotalDuration = () => {
    if (!playlist?.songs) return '0:00';
    const totalSeconds = playlist.songs.reduce((total, song) => total + (song.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins} min`;
  };

  const isOwner = user && playlist && (
    (playlist.user?.id === user.id) || 
    (playlist.userId === user.id)
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <div className="text-muted">Loading playlist...</div>
        </div>
      </MainLayout>
    );
  }

  if (error || !playlist) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <FaMusic size={64} className="text-muted mb-3" />
          <h4>Playlist not found</h4>
          <p className="text-muted mb-4">{error || 'The playlist you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link to="/playlist" className="btn btn-primary">
            Back to Playlists
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container-fluid" style={{ paddingBottom: '120px' }}>
        {/* Playlist Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))' }}>
              <div className="card-body p-4 text-white">
                <div className="row align-items-end">
                  <div className="col-md-8">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-white bg-opacity-20 rounded p-3 me-3">
                        <FaMusic size={32} />
                      </div>
                      <div>
                        <h6 className="mb-1 opacity-75">PLAYLIST</h6>
                        <h1 className="mb-2 fw-bold">{playlist.name}</h1>
                        {playlist.description && (
                          <p className="mb-3 opacity-90">{playlist.description}</p>
                        )}
                        <div className="d-flex align-items-center">
                          {playlist.user && (
                            <>
                              <UserAvatar user={playlist.user} size={24} className="me-2" />
                              <span className="me-3">
                                <Link to={`/profile/${playlist.user.username}`} className="text-white text-decoration-none fw-medium">
                                  {playlist.user.fullName || playlist.user.username}
                                </Link>
                              </span>
                            </>
                          )}
                          <span className="opacity-75">
                            {playlist.songCount || 0} songs • {getTotalDuration()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4 text-md-end">
                    <div className="d-flex gap-2 justify-content-md-end">
                      <button 
                        className="btn btn-success btn-lg rounded-pill px-4"
                        onClick={handlePlayPlaylist}
                        disabled={!playlist.songs?.length}
                      >
                        <FaPlay className="me-2" />
                        Play All
                      </button>
                      
                      {isOwner && (
                        <button 
                          className="btn btn-outline-light"
                          onClick={() => setShowEditModal(true)}
                        >
                          <FaEdit />
                        </button>
                      )}
                      
                      <div className="dropdown">
                        <button 
                          className="btn btn-outline-light"
                          data-bs-toggle="dropdown"
                        >
                          <FaEllipsisH />
                        </button>
                        <ul className="dropdown-menu">
                          <li>
                            <button className="dropdown-item">
                              <FaHeart className="me-2" />
                              Like Playlist
                            </button>
                          </li>
                          <li>
                            <button className="dropdown-item">
                              <FaShare className="me-2" />
                              Share Playlist
                            </button>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Songs List */}
        <div className="row">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-0">
                {playlist.songs && playlist.songs.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th width="50" className="border-0 ps-4">#</th>
                          <th className="border-0">Title</th>
                          <th className="border-0">Artist</th>
                          <th width="120" className="border-0 text-center">
                            <FaClock />
                          </th>
                          {isOwner && (
                            <th width="80" className="border-0"></th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {playlist.songs.map((song, index) => (
                          <tr 
                            key={song.id}
                            className={`${currentSong?.id === song.id ? 'table-active' : ''} song-row`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => handlePlaySong(song, index)}
                          >
                            <td className="ps-4 align-middle">
                              <div className="position-relative">
                                <span className="track-number">{index + 1}</span>
                                <FaPlay className="play-icon position-absolute top-50 start-50 translate-middle text-primary" style={{ display: 'none' }} />
                              </div>
                            </td>
                            <td className="align-middle">
                              <div className="d-flex align-items-center">
                                <div className="bg-primary-subtle rounded me-3 p-2">
                                  <FaMusic className="text-primary" size={16} />
                                </div>
                                <div>
                                  <div className="fw-medium">{song.title}</div>
                                  {song.genre && (
                                    <small className="text-muted">{song.genre}</small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="align-middle">
                              <Link 
                                to={`/profile/${song.artistUsername}`}
                                className="text-decoration-none text-muted"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <FaUser className="me-1" size={12} />
                                {song.artistUsername || 'Unknown Artist'}
                              </Link>
                            </td>
                            <td className="align-middle text-center text-muted">
                              {formatDuration(song.duration)}
                            </td>
                            {isOwner && (
                              <td className="align-middle text-center">
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveSong(song.id);
                                  }}
                                  disabled={removingSong === song.id}
                                  title="Remove from playlist"
                                >
                                  {removingSong === song.id ? (
                                    <span className="spinner-border spinner-border-sm" />
                                  ) : (
                                    <FaTrash size={12} />
                                  )}
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FaMusic size={48} className="text-muted mb-3" />
                    <h5>No songs in this playlist</h5>
                    <p className="text-muted mb-4">
                      {isOwner 
                        ? 'Start building your playlist by adding some songs!'
                        : 'This playlist is empty.'
                      }
                    </p>
                    {isOwner && (
                      <Link to="/search" className="btn btn-primary">
                        <FaMusic className="me-2" />
                        Find Songs to Add
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <PlaylistComments playlistId={playlist.id} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Playlist Modal */}
      <EditPlaylistModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        playlist={playlist}
        onPlaylistUpdated={handlePlaylistUpdated}
        onPlaylistDeleted={handlePlaylistDeleted}
      />

      <style jsx>{`
        .song-row:hover .track-number {
          display: none;
        }
        .song-row:hover .play-icon {
          display: block !important;
        }
      `}</style>
    </MainLayout>
  );
}

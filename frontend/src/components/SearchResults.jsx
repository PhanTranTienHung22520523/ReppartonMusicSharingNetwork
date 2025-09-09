import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import SongCard from './SongCard';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import { FaMusic, FaUser, FaUsers, FaPlay, FaHeart, FaShare, FaEye } from 'react-icons/fa';

const SearchResults = ({ results, loading, query, activeTab, sortBy }) => {
  // Debug: Log received results
  console.log("SearchResults received:", { results, activeTab, sortBy });
  
  // Sort results based on sortBy option
  const sortedResults = useMemo(() => {
    if (!results) return null;

    console.log("Processing results in sortedResults:", results);

    const sortFunction = (items, type) => {
      if (!items || !Array.isArray(items)) return [];
      
      const sorted = [...items];
      switch (sortBy) {
        case 'newest':
          return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        case 'popular':
          if (type === 'songs') {
            return sorted.sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
          } else if (type === 'users') {
            return sorted.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
          }
          return sorted;
        case 'alphabetical':
          if (type === 'songs') {
            return sorted.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
          } else if (type === 'users') {
            return sorted.sort((a, b) => (a.fullName || a.username || '').localeCompare(b.fullName || b.username || ''));
          } else if (type === 'playlists') {
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
          }
          return sorted;
        default: // relevance
          return sorted;
      }
    };

    return {
      songs: sortFunction(results.songs, 'songs'),
      users: sortFunction(results.users, 'users'),
      playlists: sortFunction(results.playlists, 'playlists')
    };
  }, [results, sortBy]);
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary mb-3" role="status" style={{width: '3rem', height: '3rem'}}>
          <span className="visually-hidden">Searching...</span>
        </div>
        <h5 className="text-muted">Searching for "{query}"...</h5>
        <p className="text-muted">Finding the best results for you</p>
      </div>
    );
  }

  if (!sortedResults || (!sortedResults.songs?.length && !sortedResults.users?.length && !sortedResults.playlists?.length)) {
    return (
      <div className="text-center py-5">
        <FaMusic size={48} className="text-muted mb-3 opacity-50" />
        <h5 className="mb-2">No results found</h5>
        <p className="text-muted mb-4">
          {query ? `No results found for "${query}"` : 'Enter a search term to find music, artists, and playlists'}
        </p>
        <div className="d-flex justify-content-center">
          <div className="text-start">
            <p className="mb-2"><strong>Try:</strong></p>
            <ul className="list-unstyled text-muted">
              <li>• Using different keywords</li>
              <li>• Checking your spelling</li>
              <li>• Using more general terms</li>
              <li>• Searching for artist names or song titles</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Filter results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'songs':
        return { songs: sortedResults.songs, users: [], playlists: [] };
      case 'users':
        return { songs: [], users: sortedResults.users, playlists: [] };
      case 'playlists':
        return { songs: [], users: [], playlists: sortedResults.playlists };
      default:
        return sortedResults;
    }
  };

  const filteredResults = getFilteredResults();
  const totalResults = (filteredResults.songs?.length || 0) + (filteredResults.users?.length || 0) + (filteredResults.playlists?.length || 0);

  return (
    <div className="search-results">
      {/* Results Summary */}
      <div className="mb-4">
        <h6 className="text-muted">
          Found {totalResults} result{totalResults !== 1 ? 's' : ''} for "{query}"
        </h6>
      </div>

      {/* Songs Section */}
      {filteredResults.songs && filteredResults.songs.length > 0 && (
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="mb-0 d-flex align-items-center">
              <FaMusic className="me-2 text-primary" />
              Songs ({filteredResults.songs.length})
            </h5>
            {filteredResults.songs.length > 8 && activeTab === 'all' && (
              <Link to={`/search?q=${query}&tab=songs`} className="btn btn-outline-primary btn-sm">
                View All Songs
              </Link>
            )}
          </div>
          <div className="row g-3">
            {(activeTab === 'songs' ? filteredResults.songs : filteredResults.songs.slice(0, 8)).map((song) => (
              <div className="col-lg-3 col-md-4 col-sm-6" key={song.id}>
                <SongCard song={song} showArtist={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Artists/Users Section */}
      {filteredResults.users && filteredResults.users.length > 0 && (
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="mb-0 d-flex align-items-center">
              <FaUser className="me-2 text-primary" />
              Artists & Users ({filteredResults.users.length})
            </h5>
            {filteredResults.users.length > 12 && activeTab === 'all' && (
              <Link to={`/search?q=${query}&tab=users`} className="btn btn-outline-primary btn-sm">
                View All Artists
              </Link>
            )}
          </div>
          <div className="row g-3">
            {(activeTab === 'users' ? filteredResults.users : filteredResults.users.slice(0, 12)).map((user) => (
              <div className="col-lg-2 col-md-3 col-sm-4 col-6" key={user.id}>
                <div className="card h-100 text-center border-0 shadow-sm hover-lift" style={{transition: 'transform 0.2s'}}>
                  <div className="card-body p-3">
                    <Link to={`/profile/${user.username}`} className="text-decoration-none">
                      <UserAvatar 
                        user={user} 
                        size={64} 
                        className="mx-auto mb-3"
                      />
                      <h6 className="card-title mb-1 text-truncate text-dark">
                        {user.fullName || user.username}
                      </h6>
                      <p className="text-muted small mb-2">
                        @{user.username}
                      </p>
                    </Link>
                    
                    <div className="mb-3">
                      {user.role === 'ARTIST' && (
                        <span className="badge bg-primary-subtle text-primary small me-1">
                          <FaMusic className="me-1" />
                          Artist
                        </span>
                      )}
                      {user.verified && (
                        <span className="badge bg-success-subtle text-success small">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="row text-center mb-2">
                      <div className="col-4">
                        <small className="text-muted d-block">Followers</small>
                        <small className="fw-bold">{user.followerCount || 0}</small>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Songs</small>
                        <small className="fw-bold">{user.songCount || 0}</small>
                      </div>
                      <div className="col-4">
                        <small className="text-muted d-block">Plays</small>
                        <small className="fw-bold">{user.totalPlays || 0}</small>
                      </div>
                    </div>

                    <FollowButton 
                      targetUserId={user.id} 
                      size="sm"
                      className="w-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Playlists Section */}
      {filteredResults.playlists && filteredResults.playlists.length > 0 && (
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h5 className="mb-0 d-flex align-items-center">
              <FaUsers className="me-2 text-primary" />
              Playlists ({filteredResults.playlists.length})
            </h5>
            {filteredResults.playlists.length > 8 && activeTab === 'all' && (
              <Link to={`/search?q=${query}&tab=playlists`} className="btn btn-outline-primary btn-sm">
                View All Playlists
              </Link>
            )}
          </div>
          <div className="row g-3">
            {(activeTab === 'playlists' ? filteredResults.playlists : filteredResults.playlists.slice(0, 8)).map((playlist) => (
              <div className="col-lg-3 col-md-4 col-sm-6" key={playlist.id}>
                <div className="card border-0 shadow-sm hover-lift h-100" style={{transition: 'transform 0.2s'}}>
                  <div className="card-body p-3">
                    <div className="d-flex align-items-start mb-3">
                      <div className="bg-primary-subtle rounded p-3 me-3">
                        <FaUsers className="text-primary" size={24} />
                      </div>
                      <div className="flex-grow-1 min-width-0">
                        <h6 className="card-title text-truncate mb-1">
                          <Link to={`/playlist/${playlist.id}`} className="text-decoration-none text-dark">
                            {playlist.name}
                          </Link>
                        </h6>
                        <p className="text-muted small mb-0 text-truncate">
                          {playlist.songCount || 0} songs
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-muted small mb-3" style={{fontSize: '0.875rem', lineHeight: '1.4'}}>
                      {playlist.description || 'No description available'}
                    </p>
                    
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <UserAvatar 
                          user={playlist.user} 
                          size={24} 
                          className="me-2"
                        />
                        <span className="text-muted small">
                          by {playlist.user?.username}
                        </span>
                      </div>
                      <div className="d-flex gap-1">
                        <button className="btn btn-outline-primary btn-sm">
                          <FaPlay size={12} />
                        </button>
                        <button className="btn btn-outline-secondary btn-sm">
                          <FaHeart size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {activeTab === 'all' && totalResults > 20 && (
        <div className="text-center py-4">
          <h6 className="mb-3">Didn't find what you're looking for?</h6>
          <div className="d-flex justify-content-center gap-2 flex-wrap">
            <Link to={`/search?q=${query}&tab=songs`} className="btn btn-outline-primary btn-sm">
              <FaMusic className="me-1" />
              More Songs
            </Link>
            <Link to={`/search?q=${query}&tab=users`} className="btn btn-outline-primary btn-sm">
              <FaUser className="me-1" />
              More Artists
            </Link>
            <Link to={`/search?q=${query}&tab=playlists`} className="btn btn-outline-primary btn-sm">
              <FaUsers className="me-1" />
              More Playlists
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;

import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SongCard from './SongCard';
import UserAvatar from './UserAvatar';
import FollowButton from './FollowButton';
import { FaMusic, FaUser, FaUsers, FaPlay, FaHeart, FaShare, FaEye } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getFollowing, getFollowStats } from '../api/followService';

const SearchResults = ({ results, loading, query, activeTab, sortBy }) => {
  const { user: currentUser } = useAuth();

  const isArtistAccount = (u) => Boolean(u?.roles?.includes?.('ARTIST') || u?.role === 'ARTIST');

  // Debug: Log received results
  console.log("SearchResults received:", { results, activeTab, sortBy });

  const [userMeta, setUserMeta] = useState({});

  useEffect(() => {
    const users = Array.isArray(results?.users) ? results.users : [];
    if (users.length === 0) return;

    let cancelled = false;

    const getUserKey = (u) => String(u?.id || u?.userId || u?.username || '');

    const loadMeta = async () => {
      try {
        let followingSet = new Set();
        if (currentUser?.id) {
          const myFollowing = await getFollowing(currentUser.id).catch(() => []);
          followingSet = new Set(
            (Array.isArray(myFollowing) ? myFollowing : [])
              .map(r => String((r?.user || r)?.userId || (r?.user || r)?.id || (r?.user || r)?.followingId || r?.followingId || ''))
              .filter(Boolean)
          );
        }

        const metaEntries = await Promise.all(
          users.map(async (u) => {
            const key = getUserKey(u);
            if (!key) return [key, null];

            const isFollowing = currentUser?.id ? followingSet.has(String(u?.id || u?.userId || '')) : false;

            // Prefer already-provided followerCount if present, otherwise fetch stats.
            let followers = typeof u?.followerCount === 'number' ? u.followerCount : undefined;
            if (followers === undefined && u?.username) {
              const byUsername = await getFollowStats(u.username).catch(() => null);
              if (byUsername && typeof byUsername.followers === 'number') followers = byUsername.followers;
            }
            if (followers === undefined) followers = 0;

            return [key, { isFollowing, followers }];
          })
        );

        if (cancelled) return;

        setUserMeta((prev) => {
          const next = { ...prev };
          for (const [k, v] of metaEntries) {
            if (k && v) next[k] = v;
          }
          return next;
        });
      } catch (e) {
        console.error('Failed to load follow meta for search results:', e);
      }
    };

    loadMeta();
    return () => {
      cancelled = true;
    };
  }, [results?.users, currentUser?.id]);
  
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
      <div className="py-4">
        <div className="text-center py-4">
          <FaMusic size={48} className="text-muted mb-3 opacity-50" />
          <h5 className="mb-2">No results found for "{query}"</h5>
          <p className="text-muted mb-4">
            We couldn't find any songs, artists, or playlists matching your search.
          </p>
        </div>

        {/* Search Tips */}
        <div className="row mb-5">
          <div className="col-md-6 offset-md-3">
            <div className="card border-0 bg-light">
              <div className="card-body">
                <h6 className="mb-3"><strong>Search Tips:</strong></h6>
                <ul className="list-unstyled text-muted mb-0">
                  <li className="mb-2">✓ Try using different keywords</li>
                  <li className="mb-2">✓ Check your spelling</li>
                  <li className="mb-2">✓ Use more general terms</li>
                  <li className="mb-2">✓ Search for artist names or song titles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Trending Artists Suggestion */}
        <div className="mb-5">
          <h5 className="mb-4 text-center">
            <FaUser className="me-2 text-primary" />
            Discover Popular Artists
          </h5>
          <div className="text-center">
            <p className="text-muted mb-3">Explore trending artists and discover new music</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {["Pop", "Rock", "Hip Hop", "R&B", "Electronic", "Jazz", "Classical", "Indie"].map((genre) => (
                <span key={genre} className="badge bg-primary-subtle text-primary fs-6 px-3 py-2">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Searches */}
        <div>
          <h5 className="mb-4 text-center">
            <FaMusic className="me-2 text-primary" />
            Popular Searches
          </h5>
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {[
                  "New Releases", "Top Charts", "Acoustic", "Workout", 
                  "Chill Vibes", "Party Mix", "Study Music", "Sleep Sounds"
                ].map((term) => (
                  <Link 
                    key={term} 
                    to={`/search?q=${encodeURIComponent(term)}`}
                    className="btn btn-outline-primary btn-sm"
                  >
                    {term}
                  </Link>
                ))}
              </div>
            </div>
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
                        {isArtistAccount(user) ? (
                          <i className="bi bi-patch-check-fill verified-tick" title="Nghệ sĩ" aria-label="Nghệ sĩ" />
                        ) : null}
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
                        <small className="text-muted d-block" style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}>Followers</small>
                        <small className="fw-bold">{userMeta[String(user.id || user.userId || user.username || '')]?.followers ?? user.followerCount ?? 0}</small>
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

                    <div className="d-flex justify-content-center">
                      <FollowButton
                        userId={String(user.id || user.userId || '')}
                        initialFollowing={Boolean(userMeta[String(user.id || user.userId || user.username || '')]?.isFollowing)}
                        size="small"
                        minWidth="unset"
                        style={{ width: 'fit-content' }}
                      />
                    </div>
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

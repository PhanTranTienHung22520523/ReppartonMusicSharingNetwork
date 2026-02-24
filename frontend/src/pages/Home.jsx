import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { fetchDurationFromUrl, normalizeSong, formatDuration } from "../utils/songUtils";
import MainLayout from "../components/MainLayout";
import PostCard from "../components/PostCard";
import SongCard from "../components/SongCard";
import Stories from "../components/Stories";
import { getUserFeed, getAllPublicPosts, createPost, getTrendingPosts } from "../api/postService";
import { getFollowing } from "../api/followService";
import { getAllSongs, searchSongs, getSongById } from "../api/songService";
import { getPersonalizedRecommendations } from "../api/recommendationService";
import { getTrendingSongs } from "../api/analyticsService";
import EmojiPicker from 'emoji-picker-react';
import {
  FaImage,
  FaMusic,
  FaSmile,
  FaChartLine,
  FaFire,
  FaPlus,
  FaPlay,
  FaMagic,
  FaTimes,
  FaSearch,
  FaClock,
  FaCheckCircle,
  FaLaughBeam
} from "react-icons/fa";
import ArtistName from "../components/ArtistName";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  // New states for quick post features
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [songSearchQuery, setSongSearchQuery] = useState("");
  const [songSearchResults, setSongSearchResults] = useState([]);
  const [selectedSong, setSelectedSong] = useState(null);
  const [searchingSongs, setSearchingSongs] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showSongSearch, setShowSongSearch] = useState(false);

  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const normalizePost = (post) => {
    if (!post) return post;

    const fallbackUser = post.user || {
      id: post.userId,
      username: post.username,
      fullName: post.fullName || post.name || post.username,
      avatarUrl: post.userProfilePic || post.avatarUrl,
    };

    const imageUrl =
      post.imageUrl ||
      post.mediaUrl ||
      (Array.isArray(post.imageUrls) && post.imageUrls.length > 0 ? post.imageUrls[0] : null);

    // Normalize attached song if present
    const attachedSong = post.attachedSong ? normalizeSong({
      ...post.attachedSong,
      duration: post.attachedSong.duration || "0:00",
    }) : null;

    return {
      ...post,
      id: post.id || post._id || post._idstr || post.postId,
      user: fallbackUser,
      imageUrl,
      attachedSong,
      sharedPost: post.sharedPost || (post.sharedPostId ? { id: post.sharedPostId } : null),
      likesCount: post.likesCount ?? post.likes ?? 0,
      commentsCount: post.commentsCount ?? post.comments ?? 0,
      sharesCount: post.sharesCount ?? post.shares ?? 0,
    };
  };

  useEffect(() => {
    const hydrateSongs = async (normalizedList) => {
      try {
        const postsNeedingSong = normalizedList.filter(p => {
          const s = p.attachedSong;
          if (!s) return false;
          const sid = s.id || s._id || s._idstr;
          if (!sid) return false;
          return !(s.title || s.name) || !s.duration || s.duration === "0:00" || s.duration === 0;
        });

        if (postsNeedingSong.length === 0) return normalizedList;

        const uniqueIds = Array.from(new Set(postsNeedingSong.map(p => String(p.attachedSong.id || p.attachedSong._id || p.attachedSong._idstr))));
        const fetched = await Promise.all(uniqueIds.map(id => getSongById(id).then(r => r?.data || r).catch(() => null)));
        const songMap = new Map();
        uniqueIds.forEach((id, idx) => {
          if (fetched[idx]) songMap.set(String(id), fetched[idx]);
        });

        const hydratedSongs = normalizedList.map(p => {
          const s = p.attachedSong;
          const sid = s ? String(s.id || s._id || s._idstr) : null;
          if (sid && songMap.has(sid)) {
            return { ...p, attachedSong: { ...s, ...songMap.get(sid) } };
          }
          return p;
        });

        // Hydrate shared posts if missing content
        const postsNeedingShared = hydratedSongs.filter(p => p.sharedPostId && (!p.sharedPost || !p.sharedPost.content));
        if (postsNeedingShared.length > 0) {
          const uniqueSharedIds = Array.from(new Set(postsNeedingShared.map(p => String(p.sharedPostId))));
          const fetchedShared = await Promise.all(uniqueSharedIds.map(id => getPostById(id).catch(() => null)));
          const sharedMap = new Map();
          uniqueSharedIds.forEach((id, idx) => {
            if (fetchedShared[idx]) sharedMap.set(String(id), normalizePost(fetchedShared[idx]));
          });

          return hydratedSongs.map(p => {
            if (p.sharedPostId && sharedMap.has(String(p.sharedPostId))) {
              return { ...p, sharedPost: sharedMap.get(String(p.sharedPostId)) };
            }
            return p;
          });
        }
        return hydratedSongs;
      } catch (err) {
        console.warn('Failed to hydrate posts', err);
        return normalizedList;
      }
    };

    const loadData = async () => {
      try {
        setLoading(true);

        // Load posts
        if (isAuthenticated()) {
          const followingList = await getFollowing(user.id).catch(() => []);
          const followingIds = (Array.isArray(followingList) ? followingList : []).map(r => {
            const u = r?.user || r || {};
            return u.id || u.userId || r?.followingId || u.username;
          }).filter(Boolean).map(String);
          if (user?.id) followingIds.push(String(user.id));

          const feedData = await getUserFeed(followingIds);
          const normalized = (feedData.content || []).map(normalizePost);
          setPosts(normalized);
          hydrateSongs(normalized).then(setPosts);
        } else {
          const publicData = await getAllPublicPosts();
          const normalized = (publicData.content || []).map(normalizePost);
          setPosts(normalized);
          hydrateSongs(normalized).then(setPosts);
        }

        // Load trending posts
        const trendingPostList = await getTrendingPosts(20, 0).catch(() => []);
        const normalizedTrending = (trendingPostList || []).map(normalizePost);
        setTrendingPosts(normalizedTrending);
        hydrateSongs(normalizedTrending).then(setTrendingPosts);

        // Load trending songs
        getTrendingSongs(20)
          .then(data => setTrendingSongs(data || []))
          .catch(() => getAllSongs().then(data => setTrendingSongs(data.content || [])));

        // Load AI recommendations separately
        if (isAuthenticated()) {
          setLoadingRecommendations(true);
          getPersonalizedRecommendations(20)
            .then(data => {
              setRecommendedSongs(data || []);
              setLoadingRecommendations(false);
            })
            .catch(err => {
              console.error("Failed to load recommendations:", err);
              setRecommendedSongs([]);
              setLoadingRecommendations(false);
            });
        }
      } catch (error) {
        console.error("Failed to load data:", error);
        // Set mock data for development
        setPosts([
          {
            id: 1,
            user: {
              id: 1,
              name: "Alice Johnson",
              username: "@alice",
              avatarUrl: "/default-avatar.png"
            },
            content: "Just dropped my latest track! 🎵 What do you think?",
            time: "2 hours ago",
            type: "text",
            likesCount: 24,
            commentsCount: 5,
            isLiked: false
          },
          {
            id: 2,
            user: {
              id: 2,
              name: "Bob Smith",
              username: "@bobbeats",
              avatarUrl: "/default-avatar.png"
            },
            content: "Amazing concert last night! The energy was incredible 🔥",
            time: "5 hours ago",
            type: "text",
            likesCount: 15,
            commentsCount: 3,
            isLiked: true
          },
        ]);

        setTrendingSongs([
          { id: 1, title: "Summer Vibes", artist: "DJ Cool", plays: 1250000, duration: "3:45" },
          { id: 2, title: "Midnight Drive", artist: "The Waves", plays: 980000, duration: "4:12" },
          { id: 3, title: "Electric Dreams", artist: "Neon Lights", plays: 750000, duration: "3:28" },
        ]);

        setTrendingPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEmojiPicker]);

  const visiblePosts = activeTab === 'trending' ? trendingPosts : posts;

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
    setTrendingPosts(prev => prev.filter(p => String(p.id) !== String(postId)));
  };

  const handleEditPost = (postId, newContent) => {
    setPosts(prev => prev.map(p => String(p.id) === String(postId) ? { ...p, content: newContent } : p));
    setTrendingPosts(prev => prev.map(p => String(p.id) === String(postId) ? { ...p, content: newContent } : p));
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle song search
  const handleSongSearch = async (e) => {
    const query = e.target.value;
    setSongSearchQuery(query);
    if (query.length > 2) {
      setSearchingSongs(true);
      try {
        const results = await searchSongs(query);
        const songs = results.data || results || [];
        setSongSearchResults(Array.isArray(songs) ? songs : []);
      } catch (err) {
        console.error(err);
        setSongSearchResults([]);
      } finally {
        setSearchingSongs(false);
      }
    } else {
      setSongSearchResults([]);
    }
  };

  const selectSong = (song) => {
    setSelectedSong(song);
    setSongSearchQuery("");
    setSongSearchResults([]);
    setShowSongSearch(false);
  };

  const handleRemoveSong = () => {
    setSelectedSong(null);
  };

  // Handle emoji selection
  const handleEmojiClick = (emojiData) => {
    setContent(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    try {
      setIsPosting(true);
      const res = await createPost(
        content.trim(),
        selectedImage,
        selectedSong?.id || selectedSong?._id
      );

      // Ensure the new post is normalized and has at least the current user and song info
      // in case the backend returns a partial object.
      const newPost = normalizePost({
        ...res,
        user: res.user || user,
        attachedSong: res.attachedSong || selectedSong,
        time: res.time || "Just now",
        createdAt: res.createdAt || new Date().toISOString()
      });

      setPosts([newPost, ...posts]);
      // Reset form
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedSong(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error("Failed to create post:", error);
      // Mock post for development
      const mockPost = normalizePost({
        id: Date.now(),
        user: user,
        content,
        imageUrl: imagePreview,
        attachedSong: selectedSong,
        time: "Just now",
        type: "text",
        likesCount: 0,
        commentsCount: 0,
        isLiked: false
      });
      setPosts([mockPost, ...posts]);
      // Reset form
      setContent("");
      setSelectedImage(null);
      setImagePreview(null);
      setSelectedSong(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
          <div className="spinner"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="row g-4">
        {/* Main Content */}
        <div className="col-lg-8">
          {/* Stories Section */}
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-transparent border-0 pb-0">
              <h6 className="fw-bold mb-0">{t('home.stories')}</h6>
            </div>
            <div className="card-body p-0">
              <Stories />
            </div>
          </div>

          {/* Welcome Section */}
          {user && (
            <div className="card card-premium mb-4 slide-up">
              <div className="card-body p-4">
                <h4 className="fw-bold mb-2">
                  {t('home.welcome', { name: user.fullName || user.username })} 👋
                </h4>
                <p className="mb-3 opacity-90">
                  {user.role === 'ARTIST'
                    ? t('home.welcomeArtist')
                    : t('home.welcomeUser')
                  }
                </p>
                <div className="d-flex gap-2">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab("trending")}
                  >
                    <FaChartLine className="me-2" size={14} />
                    {t('home.exploreTrending')}
                  </button>
                  {user.role === 'ARTIST' && (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => window.location.href = '/upload'}
                    >
                      <FaMusic className="me-2" size={14} />
                      {t('home.uploadTrack')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Create Post */}
          {user && (
            <div className="card mb-4 fade-in" style={{ position: 'relative', zIndex: 1050 }}>
              <div className="card-body p-4" style={{ overflow: 'visible' }}>
                <form onSubmit={handlePost}>
                  <div className="d-flex align-items-start gap-3 mb-3">
                    <img
                      src={user.avatarUrl || "/default-avatar.png"}
                      alt="avatar"
                      className="user-avatar"
                      width={44}
                      height={44}
                      style={{ objectFit: "cover" }}
                    />
                    <div className="flex-grow-1">
                      <textarea
                        className="form-control border-0 p-0"
                        placeholder={`${t('home.whatsOnYourMind')} ${user.fullName?.split(' ')[0] || user.username}?`}
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        rows={3}
                        style={{
                          resize: 'none',
                          fontSize: '16px',
                          background: 'transparent'
                        }}
                      />
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />

                  {/* Image Preview */}
                  {imagePreview && (
                    <div className="mb-3 position-relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="img-fluid rounded"
                        style={{ maxHeight: 300, width: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                        onClick={handleRemoveImage}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  {/* Selected Song Display */}
                  {selectedSong && (
                    <div className="mb-3 d-flex align-items-center p-2 border rounded bg-light">
                      <FaMusic className="text-primary me-3" size={24} />
                      <div className="flex-grow-1">
                        <div className="fw-bold">{selectedSong.title}</div>
                        <ArtistName
                          userId={selectedSong.artist}
                          initialName={selectedSong.artistName || (typeof selectedSong.artist === 'object' ? selectedSong.artist?.name : null)}
                          className="text-muted small"
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-link text-danger p-0"
                        onClick={handleRemoveSong}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  )}

                  {/* Song Search Dropdown */}
                  {showSongSearch && (
                    <div className="mb-3 position-relative">
                      <div className="input-group">
                        <span className="input-group-text bg-white">
                          <FaSearch className="text-muted" />
                        </span>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search for a song..."
                          value={songSearchQuery}
                          onChange={handleSongSearch}
                          autoFocus
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => {
                            setShowSongSearch(false);
                            setSongSearchQuery("");
                            setSongSearchResults([]);
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>

                      {/* Search Results */}
                      {(searchingSongs || songSearchResults.length > 0) && (
                        <div className="position-absolute w-100 mt-1 bg-white border rounded shadow-lg shadow-sm" style={{ zIndex: 9999, maxHeight: "250px", overflowY: "auto" }}>
                          {searchingSongs && (
                            <div className="p-2 text-center text-muted">
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Searching...
                            </div>
                          )}

                          {!searchingSongs && songSearchResults.map(song => (
                            <div
                              key={song.id}
                              className="p-2 border-bottom cursor-pointer hover-bg-light"
                              style={{ cursor: "pointer" }}
                              onClick={() => selectSong(song)}
                            >
                              <div className="fw-bold">{song.title}</div>
                              <ArtistName
                                userId={song.artist}
                                initialName={song.artistName || (typeof song.artist === 'object' ? song.artist?.name : null)}
                                className="text-muted small"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="d-flex align-items-center justify-content-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex gap-2 position-relative">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FaImage className="me-2" size={14} />
                        {t('home.post.photo')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowSongSearch(!showSongSearch)}
                      >
                        <FaMusic className="me-2" size={14} />
                        {t('home.post.music')}
                      </button>
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <FaSmile className="me-2" size={14} />
                        {t('home.post.feeling')}
                      </button>

                      {/* Emoji Picker */}
                      {showEmojiPicker && (
                        <div
                          ref={emojiPickerRef}
                          style={{
                            position: 'absolute',
                            bottom: '100%',
                            left: 0,
                            zIndex: 1000,
                            marginBottom: '8px'
                          }}
                        >
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </div>
                      )}
                    </div>

                    <button
                      className={`btn btn-primary ${!content.trim() ? 'opacity-50' : ''}`}
                      type="submit"
                      disabled={!content.trim() || isPosting}
                    >
                      {isPosting ? (
                        <div className="spinner me-2"></div>
                      ) : (
                        <FaPlus className="me-2" size={12} />
                      )}
                      {t('home.post.submit')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Feed Tabs */}
          <div className="d-flex gap-2 mb-4">
            <button
              className={`btn ${activeTab === 'feed' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('feed')}
            >
              {isAuthenticated() ? t('home.yourFeed') : t('home.latestPosts')}
            </button>
            <button
              className={`btn ${activeTab === 'trending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('trending')}
            >
              <FaFire className="me-2" size={14} />
              {t('home.trending')}
            </button>
          </div>

          {/* Posts Feed */}
          <div className="d-flex flex-column gap-4">
            {visiblePosts.length === 0 ? (
              <div className="card text-center py-5">
                <div className="card-body">
                  <FaMusic size={48} className="text-muted-custom mb-3" />
                  <h5 className="text-muted-custom">{t('home.noPosts')}</h5>
                  <p className="text-muted-custom mb-0">
                    {activeTab === 'trending'
                      ? t('home.noTrending')
                      : (isAuthenticated()
                        ? t('home.followHint')
                        : t('home.signInHint'))
                    }
                  </p>
                </div>
              </div>
            ) : (
              visiblePosts.map(post => (
                <PostCard key={post.id} post={post} onDelete={handleDeletePost} onEdit={handleEditPost} />
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-lg-4">
          {/* Trending Songs */}
          <div className="card mb-4 fade-in">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0">
                  <FaChartLine className="me-2 text-primary-custom" size={16} />
                  {t('home.trendingNow')}
                </h6>
                <a href="/discover" className="text-primary-custom text-decoration-none small">
                  {t('home.seeAll')}
                </a>
              </div>

              <div className="d-flex flex-column gap-2">
                {trendingSongs.slice(0, 5).map((song, index) => (
                  <div key={song.id} className="d-flex align-items-center gap-3 p-2 rounded hover-lift">
                    <div className="text-muted-custom fw-bold" style={{ fontSize: 12, width: 20 }}>
                      #{index + 1}
                    </div>
                    <div
                      className="rounded d-flex align-items-center justify-content-center"
                      style={{
                        width: 40,
                        height: 40,
                        background: "var(--card-color)",
                        border: "1px solid var(--border-color)"
                      }}
                    >
                      <FaPlay size={12} className="text-primary-custom" />
                    </div>
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-medium text-truncate" style={{ fontSize: 14 }}>
                        {song.title}
                      </div>
                      <div className="text-muted-custom text-truncate" style={{ fontSize: 12 }}>
                        {song.artist} • {(song.playsCount || song.plays || 0).toLocaleString()} plays
                      </div>
                    </div>
                    <div className="text-muted-custom" style={{ fontSize: 11 }}>
                      {formatDuration(song.duration)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Recommended for You */}
          {isAuthenticated() && (
            <div className="card fade-in" style={{ border: "2px solid var(--primary-color)", opacity: 0.9 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h6 className="fw-bold mb-0">
                    <FaMagic className="me-2 text-primary-custom" size={16} />
                    {t('home.aiRecommended')}
                  </h6>
                </div>

                {loadingRecommendations ? (
                  <div className="text-center py-4">
                    <div className="spinner-border spinner-border-sm text-primary-custom mb-2" role="status"></div>
                    <div className="text-muted-custom small">Loading your recommendation song for you...</div>
                  </div>
                ) : recommendedSongs && recommendedSongs.length > 0 ? (
                  <div className="d-flex flex-column gap-2">
                    {recommendedSongs.slice(0, 3).map((song) => (
                      <SongCard
                        key={song.id}
                        song={song}
                        variant="minimal"
                      />
                    ))}
                  </div>
                ) : !loadingRecommendations && (
                  <div className="text-center py-3 text-muted-custom small">
                    Listen to more songs to get personalized recommendations!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {user && (
            <div className="card mt-4 fade-in">
              <div className="card-body">
                <h6 className="fw-bold mb-3">{t('home.quickActions')}</h6>
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-outline d-flex align-items-center justify-content-center gap-2"
                    onClick={() => window.location.href = '/playlist'}
                  >
                    <FaMusic size={14} />
                    {t('home.createPlaylist')}
                  </button>
                  <button
                    className="btn btn-outline d-flex align-items-center justify-content-center gap-2"
                    onClick={() => window.location.href = '/discover'}
                  >
                    <FaPlay size={14} />
                    {t('home.discoverMusic')}
                  </button>
                  {user.role === 'ARTIST' && (
                    <button
                      className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                      onClick={() => window.location.href = '/upload'}
                    >
                      <FaPlus size={14} />
                      {t('home.uploadTrack')}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

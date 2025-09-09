import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import PostCard from "../components/PostCard";
import SongCard from "../components/SongCard";
import Stories from "../components/Stories";
import { getUserFeed, getAllPublicPosts, createPost } from "../api/postService";
import { getAllSongs } from "../api/songService";
import { 
  FaImage, 
  FaMusic, 
  FaSmile, 
  FaChartLine, 
  FaFire,
  FaPlus,
  FaPlay
} from "react-icons/fa";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [posts, setPosts] = useState([]);
  const [trendingSongs, setTrendingSongs] = useState([]);
  const [recommendedSongs, setRecommendedSongs] = useState([]);
  const [isPosting, setIsPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("feed");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load posts
        if (isAuthenticated()) {
          const feedData = await getUserFeed();
          setPosts(feedData.content || []);
        } else {
          const publicData = await getAllPublicPosts();
          setPosts(publicData.content || []);
        }

        // Load songs
        const songsData = await getAllSongs();
        setTrendingSongs(songsData.content || []);
        setRecommendedSongs(songsData.content || []);
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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || isPosting) return;

    try {
      setIsPosting(true);
      const newPost = await createPost({
        content: content.trim(),
        type: "text"
      });
      
      setPosts([newPost, ...posts]);
      setContent("");
    } catch (error) {
      console.error("Failed to create post:", error);
      // Mock post for development
      const mockPost = {
        id: Date.now(),
        user: {
          id: user?.id,
          name: user?.fullName || user?.username,
          username: user?.username,
          avatarUrl: user?.avatarUrl
        },
        content,
        time: "Just now",
        type: "text",
        likesCount: 0,
        commentsCount: 0,
        isLiked: false
      };
      setPosts([mockPost, ...posts]);
      setContent("");
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
              <h6 className="fw-bold mb-0">Stories</h6>
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
                  Welcome back, {user.fullName || user.username}! 👋
                </h4>
                <p className="mb-3 opacity-90">
                  {user.role === 'ARTIST' 
                    ? "Ready to share your latest creation with the world?"
                    : "Discover new music and connect with artists you love."
                  }
                </p>
                <div className="d-flex gap-2">
                  <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => setActiveTab("trending")}
                  >
                    <FaChartLine className="me-2" size={14} />
                    Explore Trending
                  </button>
                  {user.role === 'ARTIST' && (
                    <button 
                      className="btn btn-outline btn-sm"
                      onClick={() => window.location.href = '/upload'}
                    >
                      <FaMusic className="me-2" size={14} />
                      Upload Track
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Create Post */}
          {user && (
            <div className="card mb-4 fade-in">
              <div className="card-body p-4">
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
                        placeholder={`What's on your mind, ${user.fullName?.split(' ')[0] || user.username}?`}
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
                  
                  <div className="d-flex align-items-center justify-content-between pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <div className="d-flex gap-2">
                      <button type="button" className="btn btn-ghost btn-sm">
                        <FaImage className="me-2" size={14} />
                        Photo
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm">
                        <FaMusic className="me-2" size={14} />
                        Music
                      </button>
                      <button type="button" className="btn btn-ghost btn-sm">
                        <FaSmile className="me-2" size={14} />
                        Feeling
                      </button>
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
                      Post
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
              {isAuthenticated() ? 'Your Feed' : 'Latest Posts'}
            </button>
            <button
              className={`btn ${activeTab === 'trending' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveTab('trending')}
            >
              <FaFire className="me-2" size={14} />
              Trending
            </button>
          </div>

          {/* Posts Feed */}
          <div className="d-flex flex-column gap-4">
            {posts.length === 0 ? (
              <div className="card text-center py-5">
                <div className="card-body">
                  <FaMusic size={48} className="text-muted-custom mb-3" />
                  <h5 className="text-muted-custom">No posts yet</h5>
                  <p className="text-muted-custom mb-0">
                    {isAuthenticated() 
                      ? "Follow some artists to see their posts in your feed"
                      : "Sign in to see personalized content"
                    }
                  </p>
                </div>
              </div>
            ) : (
              posts.map(post => (
                <PostCard key={post.id} post={post} />
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
                  Trending Now
                </h6>
                <a href="/discover" className="text-primary-custom text-decoration-none small">
                  See all
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
                        {song.artist} • {song.plays?.toLocaleString()} plays
                      </div>
                    </div>
                    <div className="text-muted-custom" style={{ fontSize: 11 }}>
                      {song.duration}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended for You */}
          {user && recommendedSongs.length > 0 && (
            <div className="card fade-in">
              <div className="card-body">
                <h6 className="fw-bold mb-3">
                  <FaMusic className="me-2 text-primary-custom" size={16} />
                  Recommended for You
                </h6>
                
                <div className="d-flex flex-column gap-3">
                  {recommendedSongs.slice(0, 3).map(song => (
                    <SongCard key={song.id} song={song} compact />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {user && (
            <div className="card mt-4 fade-in">
              <div className="card-body">
                <h6 className="fw-bold mb-3">Quick Actions</h6>
                <div className="d-grid gap-2">
                  <button 
                    className="btn btn-outline d-flex align-items-center justify-content-center gap-2"
                    onClick={() => window.location.href = '/playlist'}
                  >
                    <FaMusic size={14} />
                    Create Playlist
                  </button>
                  <button 
                    className="btn btn-outline d-flex align-items-center justify-content-center gap-2"
                    onClick={() => window.location.href = '/discover'}
                  >
                    <FaPlay size={14} />
                    Discover Music
                  </button>
                  {user.role === 'ARTIST' && (
                    <button 
                      className="btn btn-primary d-flex align-items-center justify-content-center gap-2"
                      onClick={() => window.location.href = '/upload'}
                    >
                      <FaPlus size={14} />
                      Upload Track
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

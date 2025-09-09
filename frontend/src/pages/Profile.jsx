import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import SongCard from "../components/SongCard";
import PostCard from "../components/PostCard";
import FollowButton from "../components/FollowButton";
import UserAvatar from "../components/UserAvatar";
import { getUserProfile } from "../api/userService";
import { isFollowing } from "../api/followService";
import { getSongsByArtist } from "../api/songService";
import { getPostsByUser } from "../api/postService";

export default function Profile() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [userSongs, setUserSongs] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' hoặc 'songs'
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImg, setShowImg] = useState({ open: false, url: "" });
  
  // Determine which user profile to show
  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || (user && userId === user.id.toString());

  useEffect(() => {
    if (!targetUserId) return;
    
    setLoading(true);
    
    // Load user profile and posts
    Promise.all([
      getUserProfile(targetUserId),
      getPostsByUser(targetUserId)
    ])
      .then(([profileData, postsData]) => {
        setProfile(profileData);
        console.log("Posts data:", postsData); // Debug log
        setUserPosts(Array.isArray(postsData) ? postsData : postsData.content || []);
        
        // Load user's songs if they are an artist
        if (profileData.user.role && profileData.user.role.toUpperCase() === 'ARTIST') {
          console.log("User is ARTIST, loading songs for userId:", targetUserId);
          return getSongsByArtist(targetUserId);
        }
        console.log("User is not ARTIST, role:", profileData.user.role);
        return [];
      })
      .then(songs => {
        console.log("Songs API response:", songs);
        console.log("Songs data type:", typeof songs);
        console.log("Songs is array:", Array.isArray(songs));
        setUserSongs(Array.isArray(songs) ? songs : songs.content || []);
      })
      .catch(error => {
        console.error("Error loading profile:", error);
        setProfile(null);
        setUserSongs([]);
        setUserPosts([]);
      })
      .finally(() => setLoading(false));
    
    // Check if current user is following this profile (if not own profile)
    if (user && !isOwnProfile) {
      isFollowing(user.id, targetUserId)
        .then(result => setIsFollowingUser(result.isFollowing || false))
        .catch(() => setIsFollowingUser(false));
    }
  }, [targetUserId, user, isOwnProfile]);

  // Auto-set tab based on user role and content
  useEffect(() => {
    if (profile) {
      // Nếu là artist và có bài hát, ưu tiên hiển thị songs
      if (profile.user.role && profile.user.role.toUpperCase() === 'ARTIST' && userSongs.length > 0 && userPosts.length === 0) {
        setActiveTab('songs');
      } else {
        // Mặc định hiển thị posts
        setActiveTab('posts');
      }
    }
  }, [profile, userSongs, userPosts]);

  if (!targetUserId) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <p>Bạn cần đăng nhập để xem profile.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Đang tải...</span>
          </div>
        </div>
      ) : profile ? (
        <>
          {/* Cover */}
          <div style={{ position: "relative", marginBottom: 100 }}>
            <div
              onClick={() => setShowImg({ open: true, url: profile.user.coverUrl })}
              style={{
                width: "100%",
                height: 240,
                background: `url(${profile.user.coverUrl || '/default-cover.jpg'}) center/cover no-repeat`,
                borderRadius: 24,
                filter: "brightness(0.85)",
                cursor: "pointer",
                boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
                transition: "filter 0.2s",
                backgroundColor: "#f8f9fa"
              }}
              title="Xem ảnh bìa lớn"
            />
            
            {/* Profile info card */}
            <div
              className="shadow-lg bg-white"
              style={{
                position: "absolute",
                left: 40,
                bottom: -60,
                borderRadius: 20,
                padding: "32px 40px 32px 32px",
                display: "flex",
                alignItems: "center",
                minWidth: 420,
                zIndex: 2,
                boxShadow: "0 8px 32px rgba(111,66,193,0.10)",
              }}
            >
              <div style={{ position: "relative" }}>
                <div
                  onClick={() => profile.user.avatarUrl && setShowImg({ open: true, url: profile.user.avatarUrl })}
                  style={{ cursor: profile.user.avatarUrl ? "pointer" : "default" }}
                  title={profile.user.avatarUrl ? "Xem avatar lớn" : ""}
                >
                  <UserAvatar 
                    user={profile.user} 
                    size={110} 
                    className="shadow"
                    style={{
                      border: "5px solid #fff",
                      transition: "box-shadow 0.2s, filter 0.2s"
                    }}
                  />
                </div>
                {isOwnProfile && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: 8,
                      right: 8,
                      background: "#fff",
                      borderRadius: "50%",
                      padding: 4,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    }}
                  >
                    <i className="bi bi-camera" style={{ color: "#6f42c1", fontSize: 18 }} />
                  </span>
                )}
              </div>
              
              <div className="ms-4 flex-grow-1">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fs-2 fw-bold mb-1" style={{ color: "#222" }}>
                      {profile.user.username}
                      {profile.user.role && profile.user.role.toUpperCase() === "ARTIST" && (
                        <span className="badge bg-primary ms-2" style={{ fontSize: 14 }}>Artist</span>
                      )}
                    </div>
                    <div className="text-muted mb-1">
                      <i className="bi bi-envelope me-1"></i>
                      {profile.user.email}
                    </div>
                    {profile.user.bio && (
                      <div className="mb-2">
                        <i className="bi bi-person-lines-fill me-1"></i>
                        {profile.user.bio}
                      </div>
                    )}
                    <div style={{ fontSize: 15 }}>
                      <span className="me-3">
                        <i className="bi bi-people me-1"></i>
                        <b>{profile.followerNumber || 0}</b> followers
                      </span>
                      <span>
                        <i className="bi bi-person-check me-1"></i>
                        <b>{profile.followingNumber || 0}</b> following
                      </span>
                    </div>
                  </div>
                  
                  {/* Follow/Unfollow button */}
                  {user && !isOwnProfile && (
                    <FollowButton 
                      userId={targetUserId}
                      initialFollowing={isFollowingUser}
                      onFollowChange={(isFollowing, newFollowerCount) => {
                        setIsFollowingUser(isFollowing);
                        if (newFollowerCount !== undefined) {
                          setProfile(prev => prev ? {
                            ...prev,
                            followerNumber: newFollowerCount
                          } : null);
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="mt-5">
            <nav className="nav nav-tabs border-0" role="tablist" style={{ borderBottom: '2px solid #f8f9fa' }}>
              <button 
                className={`nav-link border-0 ${activeTab === 'posts' ? 'active bg-primary text-white' : 'text-muted'}`}
                onClick={() => setActiveTab('posts')}
                type="button"
                style={{ 
                  borderRadius: '12px 12px 0 0',
                  fontWeight: '600',
                  marginRight: '8px'
                }}
              >
                <i className="bi bi-card-text me-2"></i>
                Posts ({userPosts.length})
              </button>
              {profile.user.role && profile.user.role.toUpperCase() === 'ARTIST' && (
                <button 
                  className={`nav-link border-0 ${activeTab === 'songs' ? 'active bg-primary text-white' : 'text-muted'}`}
                  onClick={() => setActiveTab('songs')}
                  type="button"
                  style={{ 
                    borderRadius: '12px 12px 0 0',
                    fontWeight: '600',
                    marginRight: '8px'
                  }}
                >
                  <i className="bi bi-music-note me-2"></i>
                  Bài hát ({userSongs.length})
                </button>
              )}
            </nav>

            <div className="tab-content mt-4">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="tab-pane fade show active">
                  {userPosts.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-card-text" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                      <div className="mt-3">
                        {isOwnProfile ? 'Bạn chưa có bài post nào.' : `${profile.user.username} chưa có bài post nào.`}
                      </div>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {userPosts.map((post) => (
                        <div className="col-12" key={post.id}>
                          <PostCard post={post} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Songs Tab */}
              {activeTab === 'songs' && profile.user.role && profile.user.role.toUpperCase() === 'ARTIST' && (
                <div className="tab-pane fade show active">
                  {console.log("Rendering songs tab, userSongs:", userSongs, "length:", userSongs.length)}
                  {userSongs.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-music-note" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                      <div className="mt-3">
                        {isOwnProfile ? 'Bạn chưa có bài hát nào.' : `${profile.user.username} chưa có bài hát nào.`}
                      </div>
                      <div className="small mt-2 text-muted">
                        Debug: userSongs = {JSON.stringify(userSongs, null, 2)}
                      </div>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {userSongs.map((song) => (
                        <div className="col-lg-3 col-md-4 col-sm-6" key={song.id}>
                          <SongCard song={song} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Image modal */}
          {showImg.open && (
            <div
              className="modal fade show"
              style={{
                display: "block",
                background: "rgba(0,0,0,0.7)",
                zIndex: 9999,
              }}
              tabIndex={-1}
              onClick={() => setShowImg({ open: false, url: "" })}
            >
              <div
                className="d-flex align-items-center justify-content-center"
                style={{ minHeight: "100vh" }}
              >
                <img
                  src={showImg.url}
                  alt="full"
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "80vh",
                    borderRadius: 16,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    background: "#fff",
                  }}
                  onClick={e => e.stopPropagation()}
                />
                <button
                  className="btn btn-light position-absolute"
                  style={{ top: 32, right: 32, fontSize: 24, borderRadius: "50%" }}
                  onClick={() => setShowImg({ open: false, url: "" })}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-5">
          <div className="text-danger">Không tìm thấy thông tin người dùng.</div>
        </div>
      )}
    </MainLayout>
  );
}
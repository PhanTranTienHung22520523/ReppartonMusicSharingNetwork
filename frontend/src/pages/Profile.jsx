import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { normalizeSong } from "../utils/songUtils";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import SongCard from "../components/SongCard";
import PostCard from "../components/PostCard";
import FollowButton from "../components/FollowButton";
import BlockUserButton from "../components/BlockUserButton";
import UserAvatar from "../components/UserAvatar";
import EditProfileModal from "../components/EditProfileModal";
import PlaylistCard from "../components/PlaylistCard";
import { getUserProfile } from "../api/userService";
import { isUserBlocked } from "../api/userService";
import { isFollowing, getFollowers, getFollowing, getFollowStats } from "../api/followService";
import { getSongsByArtist, getSongById } from "../api/songService";
import { getPostsByUser } from "../api/postService";
import { getUserPlaylists } from "../api/playlistService";
import { getPinnedGroups } from "../api/groupService";

export default function Profile() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [userSongs, setUserSongs] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(false);
  const [playlistsError, setPlaylistsError] = useState('');
  const [playlistsLoadedFor, setPlaylistsLoadedFor] = useState(null);
  const [friends, setFriends] = useState([]);
  const [listModal, setListModal] = useState({ open: false, type: null, items: [], loading: false, error: null });
  const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'songs', 'friends', 'playlists'
  const [isFollowingUser, setIsFollowingUser] = useState(false);
  const [followTargetKey, setFollowTargetKey] = useState(null);
  const [isBlockedUser, setIsBlockedUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImg, setShowImg] = useState({ open: false, url: "" });
  const [showEditModal, setShowEditModal] = useState(false);
  const [pinnedGroups, setPinnedGroups] = useState([]);

  // Determine which user profile to show
  const targetUserId = userId || user?.id;
  const isOwnProfile = !userId || (user && String(userId) === String(user.id));

  useEffect(() => {
    if (!targetUserId) return;

    setLoading(true);

    // Load user profile first (critical)
    getUserProfile(targetUserId)
      .then(async (profileData) => {
        setProfile(profileData);
        console.log("Profile data loaded:", profileData);

        // Determine block status using real user IDs (not username in URL)
        const targetDbId = profileData?.user?.id;
        if (user?.id && targetDbId && user.id !== targetDbId) {
          isUserBlocked(user.id, targetDbId)
            .then((blocked) => setIsBlockedUser(!!blocked))
            .catch(() => setIsBlockedUser(false));
        } else {
          setIsBlockedUser(false);
        }

        const targetUsername = profileData?.user?.username;
        const targetId = profileData?.user?.id;
        const targetKeys = [targetId, targetUsername].filter((v) => v !== undefined && v !== null && String(v).trim() !== '');

        // Check if current user is following this profile (supports legacy username-based follows)
        if (user && !isOwnProfile) {
          try {
            const [byId, byUsername] = await Promise.all([
              targetId ? isFollowing(user.id, targetId).catch(() => ({ isFollowing: false })) : Promise.resolve({ isFollowing: false }),
              targetUsername ? isFollowing(user.id, targetUsername).catch(() => ({ isFollowing: false })) : Promise.resolve({ isFollowing: false })
            ]);
            const following = Boolean(byId?.isFollowing || byUsername?.isFollowing);
            setIsFollowingUser(following);
            // Use the identifier that actually matches the stored follow relation.
            setFollowTargetKey(byId?.isFollowing ? targetId : (targetUsername || targetId || null));
          } catch {
            setIsFollowingUser(false);
            setFollowTargetKey(targetUsername || targetId || null);
          }
        } else {
          setIsFollowingUser(false);
          setFollowTargetKey(targetUsername || targetId || null);
        }

        // Use social-service stats for accurate follower/following numbers.
        // Follow records can use either username or id, so take the max across both.
        Promise.all(
          targetKeys.length > 0
            ? targetKeys.map((k) => getFollowStats(k).catch(() => null))
            : [Promise.resolve(null)]
        ).then((statsList) => {
          const followersMax = Math.max(
            0,
            ...statsList.map((s) => (s && typeof s.followers === 'number' ? s.followers : 0))
          );
          const followingMax = Math.max(
            0,
            ...statsList.map((s) => (s && typeof s.following === 'number' ? s.following : 0))
          );

          const followers = followersMax || profileData?.followerNumber || 0;
          const following = followingMax || profileData?.followingNumber || 0;
          setProfile((prev) => (prev ? { ...prev, followerNumber: followers, followingNumber: following } : prev));
        });

        // Load posts (non-critical, handle errors gracefully)
        const normalizePost = (post) => {
          if (!post) return post;

          const userObj = post.user || {
            id: post.userId || post.user_id || post._id || null,
            username: post.username || null,
            name: post.fullName || post.name || post.username || null,
            avatarUrl: post.userProfilePic || post.avatarUrl || post.profileImageUrl || null,
            role: post.userRole || post.role || null,
            verified: post.verified || false,
          };

          const imageUrl = post.imageUrl || post.mediaUrl || (Array.isArray(post.imageUrls) && post.imageUrls.length > 0 ? post.imageUrls[0] : null);

          const attachedSong = post.attachedSong ? normalizeSong(post.attachedSong) : ((post.song && (typeof post.song === 'object' ? normalizeSong(post.song) : null)) || (post.songId ? { id: post.songId } : null));
          const sharedPost = post.sharedPost || (post.sharedPostId ? { id: post.sharedPostId } : null);

          return {
            ...post,
            user: userObj,
            imageUrl,
            attachedSong,
            sharedPost,
            likesCount: post.likesCount ?? post.likes ?? 0,
            commentsCount: post.commentsCount ?? post.comments ?? 0,
            sharesCount: post.sharesCount ?? post.shares ?? 0,
            createdAt: post.createdAt || post.time || post.timestamp || post.created_at || null,
            id: post.id || post._id || post._idstr || null,
          };
        };

        getPostsByUser(targetUserId)
          .then(async postsData => {
            console.log("Posts data:", postsData);
            const list = Array.isArray(postsData) ? postsData : (postsData && postsData.content ? postsData.content : (Array.isArray(postsData?.data) ? postsData.data : []));
            const normalized = (list || []).map(normalizePost);
            setUserPosts(normalized);

            // Hydrate songs for posts that are missing critical info (title, artist, or duration)
            try {
              const postsNeedingSong = normalized.filter(p => {
                const s = p.attachedSong;
                if (!s) return false;
                const sid = s.id || s._id || s._idstr;
                if (!sid) return false;

                // Fetch if missing title OR artist info OR duration
                return !(s.title || s.name) ||
                  !(s.artistName || s.artist) ||
                  !s.duration || s.duration === "0:00" || s.duration === 0;
              });
              if (postsNeedingSong.length > 0) {
                const uniqueIds = Array.from(new Set(postsNeedingSong.map(p => String(p.attachedSong.id || p.attachedSong._id || p.attachedSong._idstr))));
                const fetched = await Promise.all(uniqueIds.map(id => getSongById(id).then(r => r?.data || r).catch(() => null)));
                const songMap = new Map();
                uniqueIds.forEach((id, idx) => {
                  if (fetched[idx]) songMap.set(String(id), fetched[idx]);
                });

                const hydrated = normalized.map(p => {
                  const s = p.attachedSong;
                  const sid = s ? String(s.id || s._id || s._idstr) : null;
                  let newPost = p;
                  if (sid && songMap.has(sid)) {
                    newPost = { ...newPost, attachedSong: { ...s, ...songMap.get(sid) } };
                  }
                  return newPost;
                });

                // Hydrate shared posts if missing content
                const postsNeedingShared = hydrated.filter(p => p.sharedPostId && (!p.sharedPost || !p.sharedPost.content));
                if (postsNeedingShared.length > 0) {
                  const uniqueSharedIds = Array.from(new Set(postsNeedingShared.map(p => String(p.sharedPostId))));
                  const fetchedShared = await Promise.all(uniqueSharedIds.map(id => getPostById(id).catch(() => null)));
                  const sharedMap = new Map();
                  uniqueSharedIds.forEach((id, idx) => {
                    if (fetchedShared[idx]) sharedMap.set(String(id), normalizePost(fetchedShared[idx]));
                  });

                  setUserPosts(hydrated.map(p => {
                    if (p.sharedPostId && sharedMap.has(String(p.sharedPostId))) {
                      return { ...p, sharedPost: sharedMap.get(String(p.sharedPostId)) };
                    }
                    return p;
                  }));
                } else {
                  setUserPosts(hydrated);
                }
              }
            } catch (err) {
              console.warn('Failed to hydrate attached songs for posts', err);
            }
          })
          .catch(error => {
            console.error("Error loading posts (non-critical):", error);
            setUserPosts([]);
          });

        // Load user's songs if they are an artist (non-critical)
        // IMPORTANT: targetUserId can be a username from the URL; songs are keyed by the DB user id.
        if (profileData.user.role && profileData.user.role.toUpperCase() === 'ARTIST') {
          const artistDbId = profileData?.user?.id;
          const artistUsername = profileData?.user?.username;

          const tryFetch = async () => {
            // Prefer DB id
            if (artistDbId) {
              console.log("User is ARTIST, loading songs for artistId:", artistDbId);
              try {
                const songs = await getSongsByArtist(artistDbId);
                const list = Array.isArray(songs) ? songs : songs?.content || [];
                if (list.length > 0 || !artistUsername || String(artistUsername) === String(artistDbId)) {
                  return list;
                }
              } catch {
                // fallback below
              }
            }

            // Fallback: some legacy data uses username as identifier
            if (artistUsername) {
              console.log("Fallback: loading songs for artistUsername:", artistUsername);
              const songs = await getSongsByArtist(artistUsername);
              return Array.isArray(songs) ? songs : songs?.content || [];
            }

            return [];
          };

          tryFetch()
            .then((list) => {
              console.log("Songs API response:", list);
              setUserSongs(list);
            })
            .catch((error) => {
              console.error("Error loading songs (non-critical):", error);
              setUserSongs([]);
            });
        } else {
          console.log("User is not ARTIST, role:", profileData.user.role);
          setUserSongs([]);
        }

        // Load pinned group chats for artist profiles (non-critical)
        if (profileData?.user?.role && String(profileData.user.role).toUpperCase() === 'ARTIST') {
          getPinnedGroups(profileData.user.id)
            .then((res) => setPinnedGroups(Array.isArray(res?.data) ? res.data : []))
            .catch(() => setPinnedGroups([]));
        } else {
          setPinnedGroups([]);
        }

        // Load friends list (mutual follows). Follow identifiers can be mixed (id/username), so query both.
        const uniqBy = (arr, getKey) => {
          const map = new Map();
          (Array.isArray(arr) ? arr : []).forEach((item) => {
            const key = getKey(item);
            if (key) map.set(String(key), item);
          });
          return Array.from(map.values());
        };

        const followerKeyOf = (record) => {
          const u = record?.user || record || {};
          return u.id || u.userId || record?.followerId || u.username;
        };

        const followingKeyOf = (record) => {
          const u = record?.user || record || {};
          return u.id || u.userId || record?.followingId || u.username;
        };

        Promise.all(
          targetKeys.length > 0
            ? [
              Promise.all(targetKeys.map((k) => getFollowers(k).catch(() => []))).then((lists) => lists.flat()),
              Promise.all(targetKeys.map((k) => getFollowing(k).catch(() => []))).then((lists) => lists.flat()),
            ]
            : [Promise.resolve([]), Promise.resolve([])]
        )
          .then(([followersAll, followingAll]) => {
            const followers = uniqBy(followersAll, followerKeyOf);
            const following = uniqBy(followingAll, followingKeyOf);

            console.log("Followers:", followers, "Following:", following);

            const followerKeys = new Set(followers.map((r) => String(followerKeyOf(r) || '')));
            const mutualFriends = following.filter((r) => {
              const k = followingKeyOf(r);
              return Boolean(k && followerKeys.has(String(k)));
            });

            setFriends(mutualFriends);
          })
          .catch(error => {
            console.error("Error loading friends (non-critical):", error);
            setFriends([]);
          });
      })
      .catch(error => {
        console.error("Error loading profile (critical):", error);
        setProfile(null);
        setUserPosts([]);
        setUserSongs([]);
        setUserPlaylists([]);
        setPlaylistsLoadedFor(null);
      })
      .finally(() => setLoading(false));
  }, [targetUserId, user, isOwnProfile]);

  // Lazy-load playlists when user opens the tab.
  useEffect(() => {
    if (activeTab !== 'playlists') return;
    if (!targetUserId) return;

    const key = String(targetUserId);
    if (playlistsLoadedFor === key) return;

    setPlaylistsLoading(true);
    setPlaylistsError('');
    getUserPlaylists(targetUserId)
      .then((list) => {
        setUserPlaylists(Array.isArray(list) ? list : []);
        setPlaylistsLoadedFor(key);
      })
      .catch((err) => {
        console.error('Error loading playlists (non-critical):', err);
        setUserPlaylists([]);
        setPlaylistsLoadedFor(key);
        setPlaylistsError(err?.message || 'Không thể tải playlists');
      })
      .finally(() => setPlaylistsLoading(false));
  }, [activeTab, targetUserId, playlistsLoadedFor]);

  const openListModal = async (type) => {
    if (!targetUserId) return;
    setListModal({ open: true, type, items: [], loading: true, error: null });
    try {
      const targetUsername = profile?.user?.username;
      const targetId = profile?.user?.id;
      let items = [];
      if (type === 'followers') {
        items = await getFollowers(targetUsername || targetUserId);
      } else if (type === 'following') {
        items = await getFollowing(targetId || targetUserId);
      }

      let normalizedItems = Array.isArray(items) ? items : [];

      // Compute whether the CURRENT user already follows each item so the button renders correctly.
      // This avoids showing "Follow" for users you already follow (especially in your own "Following" list).
      if (user) {
        const getItemKey = (record) => {
          const u = record?.user || record || {};
          return String(u.userId || u.id || u.followingId || u.followerId || '');
        };

        if (type === 'following' && isOwnProfile) {
          normalizedItems = normalizedItems.map((it) => ({ ...it, __isFollowedByMe: true }));
        } else {
          const myFollowing = await getFollowing(user.id).catch(() => []);
          const myFollowingSet = new Set(
            (Array.isArray(myFollowing) ? myFollowing : []).map((r) => getItemKey(r)).filter(Boolean)
          );
          normalizedItems = normalizedItems.map((it) => {
            const key = getItemKey(it);
            return { ...it, __isFollowedByMe: Boolean(key && myFollowingSet.has(key)) };
          });
        }
      }

      setListModal({ open: true, type, items: normalizedItems, loading: false, error: null });
    } catch (err) {
      setListModal({ open: true, type, items: [], loading: false, error: err.message || 'Lỗi khi tải danh sách' });
    }
  };

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
              title={t('listen.coverTitle')}
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
                  title={profile.user.avatarUrl ? t('listen.coverTitle') : ""}
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
                      {(profile.user?.roles?.includes?.("ARTIST") || (profile.user?.role && profile.user.role.toUpperCase() === "ARTIST")) ? (
                        <i className="bi bi-patch-check-fill verified-tick" title="Nghệ sĩ" aria-label="Nghệ sĩ" />
                      ) : null}
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
                      <button
                        className="btn btn-link p-0 me-3"
                        onClick={() => openListModal('followers')}
                        style={{ textDecoration: 'none', color: '#222' }}
                        title={t('profile.followers')}
                      >
                        <i className="bi bi-people me-1"></i>
                        <b>{profile.followerNumber || 0}</b> {t('profile.followers')}
                      </button>

                      <button
                        className="btn btn-link p-0"
                        onClick={() => openListModal('following')}
                        style={{ textDecoration: 'none', color: '#222' }}
                        title={t('profile.following')}
                      >
                        <i className="bi bi-person-check me-1"></i>
                        <b>{profile.followingNumber || 0}</b> {t('profile.following')}
                      </button>
                    </div>
                  </div>

                  {isOwnProfile && (
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setShowEditModal(true)}
                      style={{ borderRadius: 8, fontWeight: 600, padding: '4px 12px' }}
                      title={t('profile.editProfile')}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>
                  )}

                  {/* Follow/Unfollow button */}
                  {user && !isOwnProfile && (
                    <>
                      {!isBlockedUser && (
                        <FollowButton
                          userId={followTargetKey || profile?.user?.id || profile.user.username}
                          initialFollowing={isFollowingUser}
                          onFollowChange={(isFollowing, newFollowerCount) => {
                            setIsFollowingUser(isFollowing);
                            // After following, prefer using DB id for future actions
                            if (isFollowing && profile?.user?.id) {
                              setFollowTargetKey(profile.user.id);
                            }
                            if (newFollowerCount !== undefined) {
                              setProfile(prev => prev ? {
                                ...prev,
                                followerNumber: newFollowerCount
                              } : null);
                            }
                          }}
                        />
                      )}
                      <BlockUserButton
                        targetUserId={profile?.user?.id}
                        targetUsername={profile.user.username}
                        onBlockStatusChange={(isBlocked) => {
                          console.log(`User ${profile.user.username} block status changed to: ${isBlocked}`);
                          setIsBlockedUser(!!isBlocked);
                        }}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {profile?.user?.role && String(profile.user.role).toUpperCase() === 'ARTIST' && pinnedGroups.length > 0 && (
            <div className="mt-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">{t('profile.pinnedGroups')}</h5>
                <Link to="/groups" className="text-decoration-none">{t('profile.viewAll')}</Link>
              </div>
              <div className="row g-3">
                {pinnedGroups.slice(0, 6).map((g) => (
                  <div className="col-12 col-md-6" key={g.id}>
                    <Link to={`/groups/${g.id}`} className="text-decoration-none">
                      <div className="card h-100">
                        <div className="card-body">
                          <div className="fw-bold text-dark">{g.groupName}</div>
                          <div className="text-muted small" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {g.lastMessage || t('messages.noMessages')}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                {t('profile.posts')} ({userPosts.length})
              </button>
              <button
                className={`nav-link border-0 ${activeTab === 'friends' ? 'active bg-primary text-white' : 'text-muted'}`}
                onClick={() => setActiveTab('friends')}
                type="button"
                style={{
                  borderRadius: '12px 12px 0 0',
                  fontWeight: '600',
                  marginRight: '8px'
                }}
              >
                <i className="bi bi-people me-2"></i>
                {t('profile.friends')} ({friends.length})
              </button>

              <button
                className={`nav-link border-0 ${activeTab === 'playlists' ? 'active bg-primary text-white' : 'text-muted'}`}
                onClick={() => setActiveTab('playlists')}
                type="button"
                style={{
                  borderRadius: '12px 12px 0 0',
                  fontWeight: '600',
                  marginRight: '8px'
                }}
              >
                <i className="bi bi-collection-play me-2"></i>
                {t('profile.playlists')} ({userPlaylists.length})
              </button>
              <button
                className={`nav-link border-0 ${activeTab === 'songs' ? 'active bg-primary text-white' : 'text-muted'} ${profile.user.role && profile.user.role.toUpperCase() !== 'ARTIST' ? 'disabled' : ''}`}
                onClick={() => {
                  if (profile.user.role && profile.user.role.toUpperCase() === 'ARTIST') {
                    setActiveTab('songs');
                  }
                }}
                type="button"
                disabled={profile.user.role && profile.user.role.toUpperCase() !== 'ARTIST'}
                style={{
                  borderRadius: '12px 12px 0 0',
                  fontWeight: '600',
                  marginRight: '8px',
                  cursor: profile.user.role && profile.user.role.toUpperCase() !== 'ARTIST' ? 'not-allowed' : 'pointer',
                  opacity: profile.user.role && profile.user.role.toUpperCase() !== 'ARTIST' ? 0.5 : 1
                }}
              >
                {profile.user.role && profile.user.role.toUpperCase() !== 'ARTIST' && (
                  <i className="bi bi-lock-fill me-2"></i>
                )}
                <i className="bi bi-music-note me-2"></i>
                {t('profile.songs')} ({userSongs.length})
              </button>
            </nav>

            <div className="tab-content mt-4">
              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="tab-pane fade show active">
                  {userPosts.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-card-text" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                      <div className="mt-3">
                        {t('profile.noPosts')}
                      </div>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {userPosts.map((post) => (
                        <div className="col-12" key={post.id}>
                          <PostCard post={post} onDelete={(id) => setUserPosts(prev => prev.filter(p => String(p.id) !== String(id)))} onEdit={(id, content) => setUserPosts(prev => prev.map(p => String(p.id) === String(id) ? { ...p, content } : p))} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Friends Tab */}
              {activeTab === 'friends' && (
                <div className="tab-pane fade show active">
                  {friends.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-people" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                      <div className="mt-3">
                        {t('profile.noFriends')}
                      </div>
                      <div className="small mt-2">
                        {t('profile.friendsHint')}
                      </div>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {friends.map((friend) => {
                        const friendUser = friend.user || friend;
                        const friendId = friendUser.id || friend.followingId || friendUser.userId || friendUser.username;
                        return (
                          <div className="col-lg-3 col-md-4 col-sm-6" key={friendId}>
                            <div className="card shadow-sm h-100" style={{ borderRadius: 12 }}>
                              <div className="card-body text-center">
                                <Link
                                  to={friendId ? `/profile/${friendId}` : '/profile'}
                                  className="text-decoration-none text-dark"
                                  style={{ display: 'inline-block' }}
                                >
                                  <div className="d-flex justify-content-center mb-3">
                                    <UserAvatar user={friendUser} size={80} />
                                  </div>
                                  <h6 className="mb-1">{friendUser.username || 'Unknown'}</h6>
                                </Link>
                                <p className="text-muted small mb-2">{friendUser.email || ''}</p>
                                {friendUser.role && friendUser.role.toUpperCase() === 'ARTIST' && (
                                  <span className="badge bg-primary">Artist</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Songs Tab */}
              {activeTab === 'songs' && (
                profile.user.role && profile.user.role.toUpperCase() === 'ARTIST' ? (
                  <div className="tab-pane fade show active">
                    {console.log("Rendering songs tab, userSongs:", userSongs, "length:", userSongs.length)}
                    {userSongs.length === 0 ? (
                      <div className="text-muted text-center py-5">
                        <i className="bi bi-music-note" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                        <div className="mt-3">
                          {t('profile.noSongs')}
                        </div>
                      </div>
                    ) : (
                      <div className="row g-4">
                        {userSongs.map((song) => (
                          <div className="col-lg-3 col-md-4 col-sm-6" key={song.id}>
                            <SongCard
                              song={{
                                ...song,
                                artistName: song.artistName || profile?.user?.username || profile?.user?.fullName || profile?.user?.name
                              }}
                              isOwner={isOwnProfile}
                              onDelete={(id) => setUserSongs(prev => prev.filter(s => s.id !== id))}
                              onUpdate={(updatedSong) => setUserSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s))}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="tab-pane fade show active">
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="bi bi-lock-fill text-muted" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
                      </div>
                      <h5 className="text-muted">{t('profile.locked')}</h5>
                      <p className="text-muted">
                        {t('profile.artistOnly')}
                      </p>
                      {isOwnProfile && (
                        <p className="small text-muted mt-3">
                          {t('profile.contactAdmin')}
                        </p>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Playlists Tab */}
              {activeTab === 'playlists' && (
                <div className="tab-pane fade show active">
                  {playlistsError && (
                    <div className="alert alert-danger" role="alert">
                      {playlistsError}
                    </div>
                  )}

                  {playlistsLoading ? (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                      <div className="text-muted mt-3">{t('common.loading')}</div>
                    </div>
                  ) : userPlaylists.length === 0 ? (
                    <div className="text-muted text-center py-5">
                      <i className="bi bi-collection-play" style={{ fontSize: '3rem', opacity: 0.3 }}></i>
                      <div className="mt-3">
                        {t('profile.noPlaylists')}
                      </div>
                    </div>
                  ) : (
                    <div className="row g-4">
                      {userPlaylists.map((pl) => (
                        <div className="col-lg-4 col-md-6" key={pl.id}>
                          <PlaylistCard
                            playlist={pl}
                            currentUser={profile?.user}
                            isOwner={isOwnProfile}
                          />
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

          {/* Followers / Following List Modal */}
          {listModal.open && (
            <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.6)', zIndex: 10000 }} tabIndex={-1} onClick={() => setListModal({ open: false, type: null, items: [], loading: false, error: null })}>
              <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh' }} onClick={e => e.stopPropagation()}>
                <div className="card" style={{ width: '90%', maxWidth: 720, borderRadius: 12 }}>
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <strong style={{ fontSize: 18 }}>{listModal.type === 'followers' ? 'Followers' : 'Following'}</strong>
                    <button className="btn btn-sm btn-light" onClick={() => setListModal({ open: false, type: null, items: [], loading: false, error: null })}><i className="bi bi-x-lg"></i></button>
                  </div>
                  <div className="card-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {listModal.loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status"></div>
                      </div>
                    ) : listModal.error ? (
                      <div className="text-danger text-center">{listModal.error}</div>
                    ) : listModal.items.length === 0 ? (
                      <div className="text-center text-muted py-4">Không có kết quả</div>
                    ) : (
                      <div className="list-group">
                        {listModal.items.map((it, idx) => {
                          const userItem = it.user || it || {};
                          const username = userItem.username || userItem.name || userItem.userName || String(userItem.id || userItem.userId || userItem.followingId || userItem.followerId || '')
                          const itemId = String(userItem.userId || userItem.id || userItem.followingId || userItem.followerId || '')

                          const handleGoToProfile = () => {
                            const profileKey = (userItem.username || userItem.userName || userItem.name || '').trim() || itemId;
                            if (!profileKey) return;
                            setListModal({ open: false, type: null, items: [], loading: false, error: null });
                            navigate(`/profile/${profileKey}`);
                          };

                          return (
                            <div
                              key={idx}
                              className="list-group-item d-flex align-items-center"
                              role="button"
                              tabIndex={0}
                              onClick={handleGoToProfile}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  handleGoToProfile();
                                }
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              <UserAvatar user={userItem} size={48} className="me-3" />
                              <div className="flex-grow-1">
                                <div className="fw-bold">{username}</div>
                                <div className="text-muted small">{userItem.email || ''}</div>
                              </div>
                              <div onClick={(e) => e.stopPropagation()}>
                                {/* Optionally add FollowButton if current user exists and item has id */}
                                {user && itemId && (
                                  <FollowButton userId={itemId} initialFollowing={Boolean(it.__isFollowedByMe)} />
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Edit Profile Modal */}
          {showEditModal && (
            <EditProfileModal
              profile={profile}
              onClose={() => setShowEditModal(false)}
              onSuccess={(updatedProfile) => {
                setProfile(updatedProfile);
                setShowEditModal(false);
              }}
            />
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
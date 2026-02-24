import { useEffect, useState } from "react";
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import UserAvatar from "./UserAvatar";
import PostComments from "./PostComments";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaPlay,
  FaPause,
  FaEllipsisH,
  FaMusic,
  FaCheckCircle
} from "react-icons/fa";
import { likePost, unlikePost } from "../api/likeService";
import ShareModal from "./ShareModal";
import ConfirmModal from "./ConfirmModal";
import EditModal from "./EditModal";
import ReportModal from "./ReportModal";
import { getPostStatistics, updatePost, deletePost } from "../api/postService";
import { getCommentCount } from "../api/commentService";
import { checkPostLike } from "../api/socialService";
import ArtistName from "./ArtistName";
import { fetchDurationFromUrl, formatDuration as formatDur } from "../utils/songUtils";

export default function PostCard({ post, onDelete, onEdit }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { currentSong, playing, setCurrentSong, setPlaying } = useMusicPlayer();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [sharesCount, setSharesCount] = useState(post.sharesCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [content, setContent] = useState(post.content || "");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [flashMessage, setFlashMessage] = useState('');
  const [dynamicDuration, setDynamicDuration] = useState(null);

  useEffect(() => {
    setContent(post.content || "");
  }, [post.content]);

  useEffect(() => {
    if (!post?.id) return;

    let cancelled = false;
    const refresh = async () => {
      try {
        const [stats, cCount] = await Promise.all([
          getPostStatistics(post.id),
          getCommentCount(post.id, 'post'),
        ]);
        if (cancelled) return;
        if (typeof stats?.likes === 'number') setLikesCount(stats.likes);
        if (typeof stats?.shares === 'number') setSharesCount(stats.shares);
        if (typeof cCount === 'number') setCommentsCount(cCount);
      } catch {
        // Best-effort; keep last known values
      }
    };

    refresh();
    const id = window.setInterval(refresh, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [post?.id]);

  useEffect(() => {
    if (!post?.id) return;

    let cancelled = false;
    const hydrateLiked = async () => {
      if (!user) {
        // If not logged in, treat as not liked.
        setIsLiked(false);
        return;
      }
      try {
        const res = await checkPostLike(post.id);
        if (cancelled) return;
        if (typeof res?.liked === 'boolean') setIsLiked(res.liked);
      } catch {
        // Best-effort; keep last known value
      }
    };

    hydrateLiked();
    return () => {
      cancelled = true;
    };
  }, [post?.id, user]);

  const handleLike = async () => {
    if (!user) {
      // Show login modal or redirect
      return;
    }

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

      if (newLikedState) {
        await likePost(post.id);
      } else {
        await unlikePost(post.id);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      console.error("Failed to toggle like:", error);
    }
  };

  const handlePlay = () => {
    if (!post?.attachedSong) return;

    // Normalize song object for the player
    const songToPlay = {
      ...post.attachedSong,
      id: post.attachedSong.id || post.attachedSong._id || post.attachedSong._idstr,
      artistName: post.attachedSong.artistName || (typeof post.attachedSong.artist === 'object' ? post.attachedSong.artist?.name : null)
    };

    if (currentSong?.id === songToPlay.id) {
      setPlaying(!playing);
    } else {
      setCurrentSong(songToPlay);
      setPlaying(true);
    }
  };

  // Dynamically load duration from file URL if missing (Cloudinary import)
  useEffect(() => {
    if (post?.attachedSong && !post.attachedSong.duration && post.attachedSong.fileUrl && !dynamicDuration) {
      fetchDurationFromUrl(post.attachedSong.fileUrl).then(dur => {
        if (dur) setDynamicDuration(dur);
      });
    }
  }, [post?.attachedSong, dynamicDuration]);

  const formatDuration = (seconds) => {
    return formatDur(seconds);
  };

  const handleShare = () => {
    if (user) {
      setShowShareModal(true);
    } else {
      // Fallback to copy link if not logged in
      const shareUrl = `${window.location.origin}/posts/${post.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setFlashMessage("Link copied to clipboard!");
        window.setTimeout(() => setFlashMessage(''), 2500);
      }).catch(err => {
        console.error('Failed to copy: ', err);
      });
    }
  };

  const formatTime = (timeString) => {
    console.log("formatTime - timeString:", timeString, "type:", typeof timeString); // Debug log

    if (!timeString) return "Now";

    const now = new Date();
    const postTime = new Date(timeString);

    console.log("formatTime - now:", now, "postTime:", postTime, "isValid:", !isNaN(postTime.getTime())); // Debug log

    if (isNaN(postTime.getTime())) {
      return "Invalid date";
    }

    const diffMs = now - postTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    console.log("formatTime - diffMs:", diffMs, "diffMins:", diffMins, "diffHours:", diffHours); // Debug log

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return postTime.toLocaleDateString();
  };

  const handleEdit = () => {
    if (!user) return;
    setShowEditModal(true);
  };

  const handleSaveEdit = async (newContent) => {
    if (!user) return;
    if (newContent === content) {
      setShowEditModal(false);
      return;
    }
    setSavingEdit(true);
    const prev = content;
    setContent(newContent);
    try {
      await updatePost(post.id, newContent);
      if (typeof onEdit === 'function') onEdit(post.id, newContent);
      setShowEditModal(false);
    } catch (err) {
      setContent(prev);
      console.error("Failed to update post", err);
      setFlashMessage("Failed to update post: " + (err.message || ''));
      window.setTimeout(() => setFlashMessage(''), 4000);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = () => {
    if (!user) return;
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      await deletePost(post.id);
      setShowConfirmDelete(false);
      if (typeof onDelete === 'function') onDelete(post.id);
    } catch (err) {
      console.error("Failed to delete post", err);
      setFlashMessage("Failed to delete post: " + (err.message || ''));
      window.setTimeout(() => setFlashMessage(''), 4000);
    } finally {
      setDeleting(false);
    }
  };

  const isVerified = post.user?.verified || post.user?.role === 'ARTIST';

  console.log("PostCard - post data:", post); // Debug log to see all post fields

  return (
    <div className="card hover-lift fade-in" style={{ maxWidth: "100%" }}>
      {flashMessage && (
        <div style={{ position: 'absolute', right: 12, top: 12, zIndex: 60 }}>
          <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="toast-body">{flashMessage}</div>
          </div>
        </div>
      )}
      <div className="card-body p-4">
        {/* Share Indicator */}
        {post.sharedPostId && (
          <div className="d-flex align-items-center gap-2 mb-2 text-muted-custom" style={{ fontSize: '13px', marginLeft: '2px' }}>
            <FaShare size={12} />
            <span>Shared a post</span>
          </div>
        )}
        {/* Post Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <Link
              to={`/profile/${post.user?.id || post.user?.username}`}
              className="text-decoration-none"
            >
              <UserAvatar
                user={post.user}
                size={44}
                className="me-3"
                style={{ cursor: 'pointer' }}
              />
            </Link>
            <div>
              <div className="d-flex align-items-center gap-2">
                <Link
                  to={`/profile/${post.user?.id || post.user?.username}`}
                  className="text-decoration-none"
                >
                  <span className="fw-bold text-primary" style={{ cursor: 'pointer' }}>
                    {post.user?.name || post.user?.username}
                  </span>
                </Link>
                {isVerified && (
                  <FaCheckCircle
                    className="text-primary-custom"
                    size={14}
                    title="Verified Artist"
                  />
                )}
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted-custom small">
                  {post.user?.username && `@${post.user.username}`}
                </span>
                <span className="text-muted-custom">•</span>
                <span className="text-muted-custom small">
                  {formatTime(post.createdAt || post.time || post.timestamp)}
                </span>
              </div>
            </div>
          </div>

          <div className="dropdown">
            <button
              className="btn btn-ghost rounded-circle p-2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <FaEllipsisH size={14} />
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              {user?.id === post.user?.id ? (
                <>
                  <li><button type="button" className="dropdown-item" onClick={handleEdit}>Edit Post</button></li>
                  <li><button type="button" className="dropdown-item text-danger" onClick={handleDelete}>Delete Post</button></li>
                </>
              ) : (
                <>
                  <li><button type="button" className="dropdown-item" onClick={() => setShowReportModal(true)}>Report Post</button></li>
                  <li><a className="dropdown-item" href="#">Hide Post</a></li>
                </>
              )}
            </ul>
          </div>
        </div>

        {/* Post Content */}
        <div className="mb-3">
          <p className="mb-0" style={{ lineHeight: 1.6, fontSize: "15px" }}>
            {post.content}
          </p>
        </div>

        {/* Music Attachment (if any) */}
        {post.attachedSong && (
          <div
            className="card mb-3"
            style={{
              background: "var(--card-color)",
              border: "1px solid var(--border-color)"
            }}
          >
            <div className="card-body p-3">
              <div className="d-flex align-items-center gap-3">
                <button
                  className="btn btn-primary rounded-circle p-2"
                  onClick={handlePlay}
                  style={{ width: 48, height: 48 }}
                >
                  {(currentSong?.id === (post.attachedSong?.id || post.attachedSong?._id || post.attachedSong?._idstr) && playing) ? (
                    <FaPause size={16} />
                  ) : (
                    <FaPlay size={16} style={{ marginLeft: 2 }} />
                  )}
                </button>

                <div className="flex-grow-1">
                  <div
                    className="fw-bold mb-1"
                    style={{ fontSize: "14px", cursor: 'pointer' }}
                    onClick={() => {
                      const sid = post.attachedSong?.id || post.attachedSong?._id || post.attachedSong?._idstr;
                      if (sid) navigate(`/listen/${encodeURIComponent(String(sid))}`);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') { const sid = post.attachedSong?.id || post.attachedSong?._id || post.attachedSong?._idstr; if (sid) navigate(`/listen/${encodeURIComponent(String(sid))}`); } }}
                  >
                    {post.attachedSong.title}
                  </div>
                  <div
                    className="text-muted-custom"
                    style={{ fontSize: "13px", cursor: 'pointer' }}
                    onClick={() => {
                      const sid = post.attachedSong?.id || post.attachedSong?._id || post.attachedSong?._idstr;
                      if (sid) navigate(`/listen/${encodeURIComponent(String(sid))}`);
                    }}
                  >
                    <ArtistName
                      userId={post.attachedSong.artist}
                      initialName={post.attachedSong.artistName || (typeof post.attachedSong.artist === 'object' ? post.attachedSong.artist?.name : post.attachedSong.artist) || post.attachedSong.artistId}
                    /> • {post.attachedSong.duration || formatDuration(dynamicDuration)}
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2 text-muted-custom">
                  <FaMusic size={12} />
                  <span style={{ fontSize: "12px" }}>
                    {((post.attachedSong.plays ?? post.attachedSong.playsCount ?? post.attachedSong.playCount) || 0).toLocaleString()} plays
                  </span>
                </div>
              </div>

              {/* Waveform visualization */}
              <div
                className="mt-3 rounded"
                style={{
                  height: 40,
                  background: "var(--gradient-bg)",
                  opacity: 0.3
                }}
              />
            </div>
          </div>
        )}

        {/* Image Attachment (if any) */}
        {post.imageUrl && (
          <div className="mb-3">
            <img
              src={post.imageUrl}
              alt="Post attachment"
              className="w-100 rounded"
              style={{
                maxHeight: 400,
                objectFit: "cover",
                cursor: "pointer"
              }}
            />
          </div>
        )}

        {/* Shared Original Post Card - Social Style */}
        {post.sharedPost && (
          <div
            className="original-post-card mb-3 p-0 rounded-4 overflow-hidden"
            style={{
              border: '1.5px solid var(--border-color)',
              background: 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'all 0.2s ease-in-out',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = 'var(--primary-color)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-color)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
            }}
            onClick={(e) => {
              e.stopPropagation();
              const originalPostId = post.sharedPost.id || post.sharedPost._id || post.sharedPostId;
              if (originalPostId) {
                navigate(`/posts/${originalPostId}`);
              }
            }}
          >
            <div className="p-3">
              {/* Header inside shared post */}
              <div className="d-flex align-items-center mb-2">
                <img
                  src={post.sharedPost.user?.avatarUrl || post.sharedPost.userProfilePic || `https://ui-avatars.com/api/?name=${post.sharedPost.user?.username || post.sharedPost.username || 'U'}&background=random`}
                  alt="Avatar"
                  className="rounded-circle me-2 border"
                  style={{ width: '28px', height: '28px', objectFit: 'cover' }}
                />
                <div>
                  <div className="d-flex align-items-center gap-1">
                    <span className="fw-bold" style={{ fontSize: '13px' }}>
                      {post.sharedPost.user?.name || post.sharedPost.user?.username || post.sharedPost.username || 'User'}
                    </span>
                    {(post.sharedPost.user?.verified || post.sharedPost.verified) && <FaCheckCircle size={10} className="text-primary" />}
                  </div>
                  <div className="text-muted-custom" style={{ fontSize: '11px' }}>
                    {post.sharedPost.createdAt ? new Date(post.sharedPost.createdAt).toLocaleDateString() : 'Original Post'}
                  </div>
                </div>
              </div>

              {/* Content inside shared post */}
              <p className="mb-2" style={{ fontSize: '13.5px', color: 'var(--text-main)', lineHeight: '1.4' }}>
                {post.sharedPost.content}
              </p>

              {/* Media if present */}
              {(post.sharedPost.imageUrl || post.sharedPost.mediaUrl) && (
                <div className="rounded-3 overflow-hidden mb-2 border" style={{ maxHeight: '300px' }}>
                  <img
                    src={post.sharedPost.imageUrl || post.sharedPost.mediaUrl}
                    alt="Shared Media"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Post Actions */}
        <div className="d-flex align-items-center justify-content-between pt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
          <div className="d-flex align-items-center gap-4">
            <button
              className={`btn btn-ghost d-flex align-items-center gap-2 ${isLiked ? 'text-danger' : ''}`}
              onClick={handleLike}
            >
              {isLiked ? (
                <FaHeart className="text-danger" size={16} />
              ) : (
                <FaRegHeart size={16} />
              )}
              <span style={{ fontSize: "14px" }}>
                {likesCount.toLocaleString()}
              </span>
            </button>

            <button
              className="btn btn-ghost d-flex align-items-center gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment size={14} />
              <span style={{ fontSize: "14px" }}>
                {commentsCount.toLocaleString()}
              </span>
            </button>

            {!post.sharedPostId && (
              <button
                className="btn btn-ghost d-flex align-items-center gap-2"
                onClick={handleShare}
              >
                <FaShare size={14} />
                <span style={{ fontSize: "14px" }}>
                  {sharesCount.toLocaleString()}
                </span>
              </button>
            )}
          </div>

          {/* Engagement Stats */}
          {(likesCount > 0 || commentsCount > 0) && (
            <div className="text-muted-custom" style={{ fontSize: "13px" }}>
              {likesCount > 0 && (
                <span>{likesCount.toLocaleString()} like{likesCount !== 1 ? 's' : ''}</span>
              )}
              {likesCount > 0 && commentsCount > 0 && <span> • </span>}
              {commentsCount > 0 && (
                <span>{commentsCount.toLocaleString()} comment{commentsCount !== 1 ? 's' : ''}</span>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border-color)" }}>
            <PostComments postId={post.id} />
          </div>
        )}
      </div>

      <ShareModal
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        post={post}
      />
      <ConfirmModal
        show={showConfirmDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmText="Delete"
        confirmVariant="danger"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => !deleting && setShowConfirmDelete(false)}
      />

      <EditModal
        show={showEditModal}
        title="Edit Post"
        initialContent={content}
        saving={savingEdit}
        onSave={handleSaveEdit}
        onClose={() => !savingEdit && setShowEditModal(false)}
      />
      <ReportModal
        show={showReportModal}
        onClose={() => setShowReportModal(false)}
        itemType="POST"
        itemId={post.id}
        onReported={() => {
          setFlashMessage('Report submitted');
          setTimeout(() => setFlashMessage(''), 3000);
        }}
      />
    </div>
  );
}
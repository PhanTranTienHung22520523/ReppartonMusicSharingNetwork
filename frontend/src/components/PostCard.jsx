import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import UserAvatar from "./UserAvatar";
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

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount] = useState(post.commentsCount || 0);
  const [sharesCount] = useState(post.sharesCount || 0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComments, setShowComments] = useState(false);

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
    setIsPlaying(!isPlaying);
    // Add actual play functionality here
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

  const isVerified = post.user?.verified || post.user?.role === 'ARTIST';

  console.log("PostCard - post data:", post); // Debug log to see all post fields

  return (
    <div className="card hover-lift fade-in" style={{ maxWidth: "100%" }}>
      <div className="card-body p-4">
        {/* Post Header */}
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div className="d-flex align-items-center">
            <UserAvatar 
              user={post.user} 
              size={44} 
              className="me-3"
            />
            <div>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold text-primary">
                  {post.user?.name || post.user?.username}
                </span>
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
                  <li><a className="dropdown-item" href="#">Edit Post</a></li>
                  <li><a className="dropdown-item text-danger" href="#">Delete Post</a></li>
                </>
              ) : (
                <>
                  <li><a className="dropdown-item" href="#">Report Post</a></li>
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
                  {isPlaying ? (
                    <FaPause size={16} />
                  ) : (
                    <FaPlay size={16} style={{ marginLeft: 2 }} />
                  )}
                </button>
                
                <div className="flex-grow-1">
                  <div className="fw-bold mb-1" style={{ fontSize: "14px" }}>
                    {post.attachedSong.title}
                  </div>
                  <div className="text-muted-custom" style={{ fontSize: "13px" }}>
                    {post.attachedSong.artist} • {post.attachedSong.duration}
                  </div>
                </div>
                
                <div className="d-flex align-items-center gap-2 text-muted-custom">
                  <FaMusic size={12} />
                  <span style={{ fontSize: "12px" }}>
                    {post.attachedSong.plays?.toLocaleString()} plays
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
                {likesCount > 0 ? likesCount.toLocaleString() : "Like"}
              </span>
            </button>
            
            <button 
              className="btn btn-ghost d-flex align-items-center gap-2"
              onClick={() => setShowComments(!showComments)}
            >
              <FaComment size={14} />
              <span style={{ fontSize: "14px" }}>
                {commentsCount > 0 ? commentsCount.toLocaleString() : "Comment"}
              </span>
            </button>
            
            <button className="btn btn-ghost d-flex align-items-center gap-2">
              <FaShare size={14} />
              <span style={{ fontSize: "14px" }}>
                {sharesCount > 0 ? sharesCount.toLocaleString() : "Share"}
              </span>
            </button>
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
            <div className="text-muted-custom text-center py-3">
              <FaComment size={24} className="mb-2" />
              <div>Comments coming soon...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
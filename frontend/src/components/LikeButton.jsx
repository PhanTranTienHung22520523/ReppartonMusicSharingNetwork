import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { likePost, unlikePost } from '../api/likeService';
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const LikeButton = ({ 
  postId, 
  initialLiked = false, 
  initialCount = 0,
  onLikeChange = () => {},
  size = 'normal',
  showCount = true
}) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikesCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Could show login modal here
      return;
    }

    if (loading) return;

    setLoading(true);
    
    try {
      if (isLiked) {
        await unlikePost(postId);
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
        onLikeChange(false, likesCount - 1);
      } else {
        await likePost(postId);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
        onLikeChange(true, likesCount + 1);
      }
    } catch (error) {
      console.error('Error liking/unliking post:', error);
      // Could show error toast here
    } finally {
      setLoading(false);
    }
  };

  const iconSize = size === 'small' ? 14 : size === 'large' ? 20 : 16;

  return (
    <button
      className={`btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none ${
        isLiked ? 'text-danger' : 'text-muted'
      }`}
      onClick={handleLike}
      disabled={loading}
      style={{
        border: 'none',
        background: 'transparent',
        transition: 'all 0.2s ease'
      }}
    >
      {loading ? (
        <div 
          className="spinner-border spinner-border-sm text-muted" 
          role="status"
          style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : isLiked ? (
        <FaHeart size={iconSize} className="text-danger" />
      ) : (
        <FaRegHeart size={iconSize} />
      )}
      
      {showCount && (
        <span className="small">
          {likesCount > 0 ? likesCount.toLocaleString() : ''}
        </span>
      )}
    </button>
  );
};

export default LikeButton;

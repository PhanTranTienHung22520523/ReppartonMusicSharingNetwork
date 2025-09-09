import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { followUser, unfollowUser } from '../api/followService';
import { FaUserPlus, FaUserMinus, FaCheck } from 'react-icons/fa';

const FollowButton = ({ 
  userId, 
  initialFollowing = false, 
  onFollowChange = () => {},
  size = 'normal',
  variant = 'primary'
}) => {
  const { user } = useAuth();
  const [isFollowingUser, setIsFollowingUser] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    setIsFollowingUser(initialFollowing);
  }, [initialFollowing]);

  const handleFollow = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      // Could show login modal here
      return;
    }

    if (loading) return;

    setLoading(true);
    
    try {
      if (isFollowingUser) {
        await unfollowUser(user.id, userId);
        setIsFollowingUser(false);
        setFollowerCount(prev => Math.max(0, prev - 1));
        onFollowChange(false, followerCount - 1);
      } else {
        await followUser(user.id, userId);
        setIsFollowingUser(true);
        setFollowerCount(prev => prev + 1);
        onFollowChange(true, followerCount + 1);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      // Could show error toast here
    } finally {
      setLoading(false);
    }
  };

  // Don't show follow button for own profile
  if (!user || user.id === userId) {
    return null;
  }

  const buttonSize = size === 'small' ? 'btn-sm' : size === 'large' ? 'btn-lg' : '';
  const buttonVariant = variant === 'outline' ? 'btn-outline-primary' : 'btn-primary';

  return (
    <button
      className={`btn ${buttonVariant} ${buttonSize} d-flex align-items-center gap-2`}
      onClick={handleFollow}
      disabled={loading}
      style={{
        minWidth: size === 'small' ? '80px' : '100px',
        transition: 'all 0.2s ease'
      }}
    >
      {loading ? (
        <>
          <div 
            className="spinner-border spinner-border-sm" 
            role="status"
            style={{ width: '14px', height: '14px' }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
          <span>...</span>
        </>
      ) : isFollowingUser ? (
        <>
          <FaCheck size={12} />
          <span>Following</span>
        </>
      ) : (
        <>
          <FaUserPlus size={12} />
          <span>Follow</span>
        </>
      )}
    </button>
  );
};

export default FollowButton;

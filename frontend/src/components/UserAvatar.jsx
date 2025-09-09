import React from 'react';

// Generate a consistent color based on user name
const getAvatarColor = (name) => {
  if (!name) return '#6c757d'; // Default gray
  
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#FC427B', '#FD79A8', '#FDCB6E', '#6C5CE7', '#A29BFE',
    '#74B9FF', '#81ECEC', '#00B894', '#55A3FF', '#FD79A8'
  ];
  
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

// Get initials from name
const getInitials = (name) => {
  if (!name) return '?';
  
  const words = name.trim().split(' ');
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
};

const UserAvatar = ({ 
  user, 
  size = 40, 
  className = '', 
  style = {},
  showOnlineStatus = false 
}) => {
  // Determine what name to use for initials
  const displayName = user?.fullName || user?.username || user?.email || 'User';
  const avatarUrl = user?.avatarUrl;
  
  console.log("UserAvatar - user:", user, "displayName:", displayName, "avatarUrl:", avatarUrl); // Debug log
  
  if (avatarUrl && avatarUrl.trim() !== '' && avatarUrl !== '/default-avatar.png') {
    return (
      <div 
        className={`position-relative ${className}`}
        style={{ width: size, height: size, ...style }}
      >
        <img
          src={avatarUrl}
          alt={displayName}
          className="rounded-circle"
          style={{
            width: size,
            height: size,
            objectFit: 'cover',
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          onError={(e) => {
            // If image fails to load, hide it and show initials instead
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        
        {/* Fallback initials avatar (hidden by default) */}
        <div
          style={{
            display: 'none',
            width: size,
            height: size,
            borderRadius: '50%',
            backgroundColor: getAvatarColor(displayName),
            color: 'white',
            fontSize: size * 0.4,
            fontWeight: 'bold',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          {getInitials(displayName)}
        </div>
        
        {/* Online status indicator */}
        {showOnlineStatus && (
          <div
            className="position-absolute"
            style={{
              bottom: 0,
              right: 0,
              width: size * 0.25,
              height: size * 0.25,
              backgroundColor: '#28a745',
              borderRadius: '50%',
              border: '2px solid #fff'
            }}
          />
        )}
      </div>
    );
  }
  
  // Show initials avatar when no image URL
  return (
    <div 
      className={`position-relative ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <div
        className="d-flex justify-content-center align-items-center rounded-circle"
        style={{
          width: size,
          height: size,
          backgroundColor: getAvatarColor(displayName),
          color: 'white',
          fontSize: size * 0.4,
          fontWeight: 'bold',
          border: '2px solid #fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {getInitials(displayName)}
      </div>
      
      {/* Online status indicator */}
      {showOnlineStatus && (
        <div
          className="position-absolute"
          style={{
            bottom: 0,
            right: 0,
            width: size * 0.25,
            height: size * 0.25,
            backgroundColor: '#28a745',
            borderRadius: '50%',
            border: '2px solid #fff'
          }}
        />
      )}
    </div>
  );
};

export default UserAvatar;

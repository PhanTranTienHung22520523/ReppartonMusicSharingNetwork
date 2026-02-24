import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { FaTimes, FaHeart, FaComment } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import UserAvatar from "./UserAvatar";

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const { user: authUser } = useAuth();
  
  const currentStory = stories[currentIndex];
  const duration = currentStory?.type === 'video' ? 15000 : 5000; // give videos more time

  useEffect(() => {
    if (!currentStory) return;
    
    setProgress(0);
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Auto advance to next story
          if (currentIndex < stories.length - 1) {
            setCurrentIndex(currentIndex + 1);
          } else {
            onClose();
          }
          return 0;
        }
        return prev + (100 / (duration / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentIndex, currentStory, stories.length, onClose]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [onClose]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (!currentStory) return null;

  const mediaUrl = currentStory.imageUrl;
  const isVideo =
    currentStory.type === 'video' ||
    (typeof mediaUrl === 'string' && /\.(mp4|webm|ogg)$/i.test(mediaUrl));

  const isMine = Boolean(
    authUser?.id &&
      (String(currentStory?.author?.id || "") === String(authUser.id))
  );
  const storyAuthor = isMine
    ? {
        ...currentStory.author,
        ...authUser,
      }
    : currentStory.author;
  const displayName = isMine
    ? "Tin của tôi"
    : storyAuthor?.fullName || storyAuthor?.username || storyAuthor?.email || "Người dùng";

  const viewer = (
    <div
      className="story-viewer d-flex align-items-center justify-content-center"
      style={{ 
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.96)',
        zIndex: 2147483647,
      }}
    >
      {/* Progress bars */}
      <div className="position-absolute top-0 start-0 w-100 p-3" style={{ zIndex: 10001 }}>
        <div className="d-flex gap-1">
          {stories.map((_, index) => (
            <div 
              key={index}
              className="flex-fill bg-white bg-opacity-25 rounded"
              style={{ height: 3 }}
            >
              <div 
                className="bg-white rounded h-100"
                style={{ 
                  width: index < currentIndex ? '100%' : 
                         index === currentIndex ? `${progress}%` : '0%',
                  transition: index === currentIndex ? 'none' : 'width 0.3s ease'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="position-absolute top-0 start-0 w-100 p-3 pt-5" style={{ zIndex: 10001 }}>
        <div className="d-flex align-items-center justify-content-between text-white">
          <div className="d-flex align-items-center gap-3">
            <UserAvatar 
              user={storyAuthor} 
              size={40}
            />
            <div>
              <h6 className="mb-0 fw-bold">{displayName}</h6>
              <small className="text-white-50">
                {new Date(currentStory.createdAt).toLocaleString()}
              </small>
            </div>
          </div>
          <button 
            className="btn btn-link text-white p-1"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
      </div>

      {/* Story content */}
      <div
        className="story-content position-relative"
        style={{
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {mediaUrl && mediaUrl.trim() !== '' ? (
          <div className="position-relative w-100 h-100">
            {/* Blurred backdrop (only for images) */}
            {!isVideo && (
              <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                  backgroundImage: `url(${mediaUrl})`,
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: 'cover',
                  filter: 'blur(28px)',
                  transform: 'scale(1.08)',
                  opacity: 0.55,
                }}
              />
            )}

            {/* Foreground media (contain like FB/IG desktop) */}
            <div
              className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
              style={{ padding: '72px 16px 72px' }}
            >
              {isVideo ? (
                <video
                  src={mediaUrl}
                  controls
                  autoPlay
                  muted
                  playsInline
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-2xl)',
                    background: 'rgba(0,0,0,0.25)',
                  }}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt="Story"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 'var(--border-radius-lg)',
                    boxShadow: 'var(--shadow-2xl)',
                    background: 'rgba(0,0,0,0.25)',
                  }}
                />
              )}
            </div>

            {/* Content overlay for image stories */}
            {currentStory.content && (
              <div 
                className="position-absolute bottom-0 start-0 w-100 p-4"
                style={{ 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.85))',
                  color: 'white',
                  zIndex: 2,
                }}
              >
                <div className="mx-auto" style={{ maxWidth: 720 }}>
                  <p className="mb-0 fs-5 fw-semibold">{currentStory.content}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="d-flex align-items-center justify-content-center text-white w-100 h-100"
            style={{ 
              background: 'var(--gradient-primary)',
            }}
          >
            <div className="text-center p-4">
              <div className="d-flex justify-content-center mb-3">
                <UserAvatar user={storyAuthor} size={56} />
              </div>
              <h4 className="fw-bold mb-2">{currentStory.content || 'No content'}</h4>
              <small className="text-white-50">{displayName}</small>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x p-3">
        <div className="d-flex gap-3">
          <button className="btn btn-link text-white p-2">
            <FaHeart size={20} />
          </button>
          <button className="btn btn-link text-white p-2">
            <FaComment size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return viewer;
  return createPortal(viewer, document.body);
}

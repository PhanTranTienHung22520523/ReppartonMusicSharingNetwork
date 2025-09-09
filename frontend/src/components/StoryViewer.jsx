import { useState, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes, FaHeart, FaComment } from "react-icons/fa";
import { useAuth } from "../contexts/AuthContext";
import UserAvatar from "./UserAvatar";

export default function StoryViewer({ stories, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  useAuth();
  
  const currentStory = stories[currentIndex];
  const duration = 5000; // 5 seconds per story

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

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, stories.length, onClose, goToPrevious, goToNext]);

  if (!currentStory) return null;

  console.log("Current story data:", currentStory); // Debug log

  return (
    <div 
      className="story-viewer position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.9)', 
        zIndex: 9999 
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
              user={currentStory.author} 
              size={40}
            />
            <div>
              <h6 className="mb-0 fw-bold">{currentStory.author?.username}</h6>
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

      {/* Navigation areas */}
      <div 
        className="position-absolute start-0 top-0 h-100 d-flex align-items-center justify-content-start"
        style={{ width: '20%', cursor: 'pointer', zIndex: 10000 }}
        onClick={goToPrevious}
      >
        {currentIndex > 0 && (
          <FaChevronLeft className="text-white ms-3" size={24} />
        )}
      </div>

      <div 
        className="position-absolute end-0 top-0 h-100 d-flex align-items-center justify-content-end"
        style={{ width: '20%', cursor: 'pointer', zIndex: 10000 }}
        onClick={goToNext}
      >
        <FaChevronRight className="text-white me-3" size={24} />
      </div>

      {/* Story content */}
      <div className="story-content position-relative">
        {currentStory.imageUrl && currentStory.imageUrl.trim() !== '' ? (
          <div className="position-relative">
            <img
              src={currentStory.imageUrl}
              alt="Story"
              className="img-fluid"
              style={{ 
                maxHeight: '80vh', 
                maxWidth: '80vw',
                objectFit: 'contain'
              }}
            />
            {/* Content overlay for image stories */}
            {currentStory.content && (
              <div 
                className="position-absolute bottom-0 start-0 w-100 p-4"
                style={{ 
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                  color: 'white'
                }}
              >
                <p className="mb-0 fs-5">{currentStory.content}</p>
              </div>
            )}
          </div>
        ) : (
          <div 
            className="d-flex align-items-center justify-content-center text-white"
            style={{ 
              width: '80vw',
              height: '80vh',
              maxWidth: 400,
              maxHeight: 600,
              background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px'
            }}
          >
            <div className="text-center p-4">
              <h4 className="fw-bold mb-3">{currentStory.content || 'No content'}</h4>
              <small className="text-white-50">
                {currentStory.author?.username}
              </small>
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
}

import { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import StoryViewer from "./StoryViewer";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { getAllStories } from "../api/storyService";

export default function Stories() {
  const [stories, setStories] = useState([]);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const storiesData = await getAllStories();
      console.log("Raw stories data from backend:", storiesData); // Debug log
      
      // Transform backend data to frontend format
      const transformedStories = storiesData.map(story => {
        console.log("Processing story:", story); // Debug each story
        
        // Try different fields for username
        const displayName = story.userDisplayName || 
                           story.userName || 
                           story.userFullName || 
                           story.username || 
                           story.fullName ||
                           `User ${story.userId.substring(0, 8)}`;
        
        return {
          id: story.id,
          content: story.textContent || "",
          imageUrl: story.contentUrl,
          author: {
            id: story.userId,
            username: displayName,
            fullName: story.userFullName || story.userDisplayName,
            avatarUrl: story.userAvatarUrl || "/default-avatar.png"
          },
          createdAt: story.createdAt,
          expiresAt: story.expiresAt
        };
      });
      
      console.log("Transformed stories:", transformedStories); // Debug transformed data
      setStories(transformedStories);
    } catch (error) {
      console.error("Error loading stories:", error);
      // Fallback to mock data if API fails
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (index) => {
    setSelectedStoryIndex(index);
    setShowViewer(true);
  };

  const handleAddStory = () => {
    // Navigate to upload page with story tab
    window.location.href = "/upload";
  };

  if (loading) {
    return (
      <div className="stories-container d-flex gap-3 p-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="story-item-skeleton">
            <div className="placeholder-glow">
              <div className="placeholder rounded-circle" style={{ width: 60, height: 60 }}></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="stories-container d-flex gap-3 p-3 overflow-auto">
        {/* Add Story Button */}
        {user && (
          <div className="story-item text-center flex-shrink-0">
            <button
              className="btn btn-outline-primary rounded-circle d-flex align-items-center justify-content-center"
              style={{ width: 60, height: 60 }}
              onClick={handleAddStory}
              title="Add your story"
            >
              <FaPlus size={20} />
            </button>
            <small className="d-block mt-1 text-muted">Your Story</small>
          </div>
        )}

        {/* Stories */}
        {stories.map((story, index) => (
          <div key={story.id} className="story-item text-center flex-shrink-0">
            <button
              className="btn p-0 rounded-circle overflow-hidden position-relative border-0"
              style={{ width: 60, height: 60 }}
              onClick={() => handleStoryClick(index)}
            >
              <UserAvatar 
                user={story.author} 
                size={60}
                style={{
                  border: '2px solid #007bff'
                }}
              />
            </button>
            <small className="d-block mt-1 text-truncate" style={{ maxWidth: 60 }}>
              {story.author.username}
            </small>
          </div>
        ))}

        {stories.length === 0 && (
          <div className="text-center text-muted p-4">
            <p>No stories available</p>
            {user && (
              <button className="btn btn-primary btn-sm" onClick={handleAddStory}>
                Create your first story
              </button>
            )}
          </div>
        )}
      </div>

      {/* Story Viewer Modal */}
      {showViewer && (
        <StoryViewer
          stories={stories}
          initialIndex={selectedStoryIndex}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}

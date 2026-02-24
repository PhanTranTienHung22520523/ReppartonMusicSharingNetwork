import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";
import StoryViewer from "./StoryViewer";
import UserAvatar from "./UserAvatar";
import { useAuth } from "../contexts/AuthContext";
import { getAllStories, getFollowingStories } from "../api/storyService";
import { getFollowing } from "../api/followService";
import { getUserById } from "../api/userService";
import { API_ENDPOINTS } from "../config/api.config";

export default function Stories({ initialStoryId } = {}) {
  const [storyGroups, setStoryGroups] = useState([]);
  const [viewerStories, setViewerStories] = useState([]);
  const [showViewer, setShowViewer] = useState(false);
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const autoOpenedRef = useRef(false);

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    if (!initialStoryId) return;
    if (loading) return;
    if (autoOpenedRef.current) return;
    if (!Array.isArray(storyGroups) || storyGroups.length === 0) return;

    const wantedId = String(initialStoryId);
    for (const group of storyGroups) {
      const list = Array.isArray(group?.stories) ? group.stories : [];
      const idx = list.findIndex((s) => String(s?.id) === wantedId);
      if (idx >= 0) {
        autoOpenedRef.current = true;
        setViewerStories(list);
        setSelectedStoryIndex(idx);
        setShowViewer(true);
        break;
      }
    }
  }, [initialStoryId, loading, storyGroups]);

  const loadStories = async () => {
    try {
      let storiesData = [];

      if (user?.id && user?.token) {
        try {
          const following = await getFollowing(user.id);
          const followingIds = (Array.isArray(following) ? following : [])
            .map((u) => u?.id || u?.userId || u?._id)
            .filter(Boolean);
          const feedUserIds = Array.from(new Set([user.id, ...followingIds]));
          storiesData = await getFollowingStories(feedUserIds);
        } catch (feedError) {
          console.warn("Failed to load feed stories, falling back to public stories:", feedError);
          storiesData = await getAllStories();
        }
      } else {
        storiesData = await getAllStories();
      }
      console.log("Raw stories data from backend:", storiesData); // Debug log

      // Enrich story authors with user info (name/avatar) when backend doesn't provide it
      const userInfoById = new Map();
      if (user?.token) {
        const uniqueUserIds = Array.from(
          new Set((Array.isArray(storiesData) ? storiesData : []).map((s) => s?.userId).filter(Boolean))
        );
        await Promise.all(
          uniqueUserIds.map(async (userId) => {
            try {
              const userInfo = await getUserById(userId);
              if (userInfo) userInfoById.set(userId, userInfo);
            } catch {
              // Best-effort enrichment only
            }
          })
        );
      }
      
      // Transform backend data to frontend format
      const transformedStories = storiesData.map(story => {
        console.log("Processing story:", story); // Debug each story

        const apiUser = story?.userId ? userInfoById.get(story.userId) : null;
        const apiDisplayName =
          apiUser?.fullName ||
          apiUser?.displayName ||
          apiUser?.userDisplayName ||
          apiUser?.userName ||
          apiUser?.username ||
          apiUser?.email;
        const apiAvatarUrl = apiUser?.avatarUrl || apiUser?.avatar || apiUser?.profileImageUrl;
        
        const normalizeMediaUrl = (rawUrl) => {
          if (!rawUrl || typeof rawUrl !== 'string') return '';
          const url = rawUrl.trim();
          if (!url) return '';
          if (/^https?:\/\//i.test(url)) return url;

          // Backward-compat: previously we stored "uploaded/<name>" as a placeholder.
          if (url.startsWith('uploaded/')) {
            return `${API_ENDPOINTS.stories}/uploads/${url.slice('uploaded/'.length)}`;
          }
          if (url.startsWith('uploads/')) {
            return `${API_ENDPOINTS.stories}/${url}`;
          }

          // If backend returns a leading slash path, make it absolute via gateway.
          if (url.startsWith('/')) {
            const base = API_ENDPOINTS.stories.replace(/\/stories$/, '');
            return `${base}${url}`;
          }

          return `${API_ENDPOINTS.stories}/${url}`;
        };

        // Try different fields for username
        const isMine = Boolean(user?.id && story?.userId && String(story.userId) === String(user.id));
        const displayName =
          (isMine ? "Tin của tôi" : null) ||
          story.userDisplayName ||
          story.userName ||
          story.userFullName ||
          story.username ||
          story.fullName ||
          apiDisplayName ||
          "Người dùng";
        
        return {
          id: story.id,
          type: (story.type || '').toString().toLowerCase(),
          content: story.textContent || "",
          imageUrl: normalizeMediaUrl(story.contentUrl),
          author: {
            id: story.userId,
            username: displayName,
            fullName: story.userFullName || story.userDisplayName,
            avatarUrl: story.userAvatarUrl || apiAvatarUrl || "/default-avatar.png"
          },
          createdAt: story.createdAt,
          expiresAt: story.expiresAt
        };
      });
      
      // Group by userId so each person shows once in the story row.
      const byUserId = new Map();
      for (const story of transformedStories) {
        const userId = story?.author?.id;
        if (!userId) continue;
        if (!byUserId.has(userId)) byUserId.set(userId, []);
        byUserId.get(userId).push(story);
      }

      const parseTime = (value) => {
        const t = Date.parse(value);
        return Number.isFinite(t) ? t : 0;
      };

      const grouped = Array.from(byUserId.entries()).map(([userId, items]) => {
        // Oldest -> newest (chronological)
        const sorted = [...items].sort((a, b) => parseTime(a.createdAt) - parseTime(b.createdAt));
        const latest = sorted[sorted.length - 1];
        return {
          userId,
          author: latest?.author,
          stories: sorted,
          earliest: sorted[0],
          latest,
        };
      });

      // Order groups: earliest story first (oldest -> newest)
      grouped.sort((a, b) => parseTime(a.earliest?.createdAt) - parseTime(b.earliest?.createdAt));

      console.log("Transformed stories:", transformedStories);
      console.log("Grouped stories:", grouped);
      setStoryGroups(grouped);
    } catch (error) {
      console.error("Error loading stories:", error);
      // Fallback to mock data if API fails
      setStoryGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (groupIndex) => {
    const group = storyGroups[groupIndex];
    const list = group?.stories || [];
    setViewerStories(list);
    setSelectedStoryIndex(0);
    setShowViewer(true);
  };

  const handleAddStory = () => {
    navigate("/create-story");
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
        {storyGroups.map((group, index) => (
          <div key={group.userId} className="story-item text-center flex-shrink-0">
            <button
              className="btn p-0 rounded-circle overflow-hidden position-relative border-0"
              style={{ width: 60, height: 60 }}
              onClick={() => handleStoryClick(index)}
            >
              <UserAvatar 
                user={group.author} 
                size={60}
                style={{
                  border: '2px solid #007bff'
                }}
              />
            </button>
            <small className="d-block mt-1 text-truncate" style={{ maxWidth: 60 }}>
              {group.author?.username}
            </small>
          </div>
        ))}

        {storyGroups.length === 0 && (
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
          stories={viewerStories}
          initialIndex={selectedStoryIndex}
          onClose={() => setShowViewer(false)}
        />
      )}
    </>
  );
}

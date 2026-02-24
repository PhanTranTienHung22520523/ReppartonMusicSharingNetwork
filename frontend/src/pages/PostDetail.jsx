import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import PostCard from "../components/PostCard";
import { getPostById } from "../api/postService";

export default function PostDetail() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const normalizePost = (p) => {
    if (!p) return p;

    const fallbackUser = p.user || {
      id: p.userId,
      username: p.username,
      fullName: p.fullName || p.name || p.username,
      avatarUrl: p.userProfilePic || p.avatarUrl,
    };

    const imageUrl =
      p.imageUrl ||
      p.mediaUrl ||
      (Array.isArray(p.imageUrls) && p.imageUrls.length > 0 ? p.imageUrls[0] : null);

    return {
      ...p,
      user: fallbackUser,
      imageUrl,
      likesCount: p.likesCount ?? p.likes ?? 0,
      commentsCount: p.commentsCount ?? p.comments ?? 0,
      sharesCount: p.sharesCount ?? p.shares ?? 0,
      sharedPost: p.sharedPost ? normalizePost(p.sharedPost) : null,
    };
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!postId) {
        setError("Missing post id");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getPostById(postId);
        if (!cancelled) {
          setPost(normalizePost(data));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load post");
          setPost(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  return (
    <MainLayout>
      <div className="container" style={{ maxWidth: 900, paddingTop: 24 }}>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h4 className="mb-0">Post</h4>
          <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
            Back
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        ) : post ? (
          <PostCard post={post} onDelete={(id) => { setPost(null); setError("This post is unavailable"); }} onEdit={(id, content) => setPost(prev => prev ? { ...prev, content } : prev)} />
        ) : (
          <div className="alert alert-info" role="alert">
            Post not found
          </div>
        )}
      </div>
    </MainLayout>
  );
}

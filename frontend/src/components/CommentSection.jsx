import { useEffect, useState } from "react";
import { getSongComments, addCommentToSong } from "../api/commentService";
import { useAuth } from "../contexts/AuthContext";

export default function CommentSection({ songId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!songId) return;
    loadComments();
  }, [songId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await getSongComments(songId);
      setComments(response || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !input.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addCommentToSong(songId, input.trim());
      setInput("");
      // Reload comments
      await loadComments();
    } catch (error) {
      console.error('Failed to add comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h6 className="fw-bold mb-3">Bình luận</h6>
      <form className="mb-3 d-flex" onSubmit={handleSubmit}>
        <input
          className="form-control me-2"
          placeholder="Viết bình luận..."
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={!user}
        />
        <button className="btn btn-primary" type="submit" disabled={!user || !input.trim() || submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi'}
        </button>
      </form>
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <div style={{ maxHeight: 320, overflowY: "auto" }}>
          {comments.length === 0 && <div className="text-muted">Chưa có bình luận nào.</div>}
          {comments.map(c => (
            <div key={c.id} className="mb-3">
              <div className="d-flex align-items-center mb-1">
                <img src={c.userAvatar || "/default-avatar.png"} alt="avatar" className="rounded-circle me-2" width={32} height={32} style={{ objectFit: "cover" }} />
                <div className="fw-bold">{c.userName || "User"}</div>
                <span className="text-muted ms-2" style={{ fontSize: 13 }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}</span>
              </div>
              <div>{c.content}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
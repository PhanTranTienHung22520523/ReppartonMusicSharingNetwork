import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { sharePost } from "../api/postService";
import { useAuth } from "../contexts/AuthContext";

export default function ShareModal({ show, onHide, post }) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleShare = async () => {
    if (!user) return;

    setLoading(true);
    setError("");

    try {
      await sharePost(post.id, content);
      onHide();
      setContent("");
      // Using custom flash message would be better, but for now we follow the existing pattern
      // but making it more modern would be nice.
      if (typeof window.showToast === 'function') {
        window.showToast("Post shared successfully!", "success");
      } else {
        alert("Post shared successfully!");
      }
    } catch (err) {
      setError(err.message || "Failed to share post");
    } finally {
      setLoading(false);
    }
  };

  if (!post) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Share Post</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 p-3 border rounded bg-light">
          <strong>@{post.user?.username || "User"}</strong>
          <p className="mb-0 text-truncate">{post.content}</p>
        </div>

        <Form.Group className="mb-3">
          <Form.Label>Add a caption (optional)</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Say something about this..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </Form.Group>

        {error && <div className="text-danger mb-3">{error}</div>}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleShare} disabled={loading}>
          {loading ? "Sharing..." : "Share Now"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

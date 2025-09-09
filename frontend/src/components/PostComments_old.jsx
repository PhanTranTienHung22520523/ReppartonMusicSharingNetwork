import { useState, useEffect, useCallback } from 'react';
import { FaComment, FaHeart, FaReply, FaPaperPlane, FaUser, FaNewspaper } from 'react-icons/fa';
import { getPostComments, addCommentToPost } from '../api/commentService';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from './UserAvatar';

export default function PostComments({ postId, className = '' }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const loadComments = useCallback(async () => {
    if (!showComments) return;
    
    setLoading(true);
    setError('');
    try {
      // Mock data for demo
      const mockComments = [
        {
          id: '1',
          content: 'Great post! Thanks for sharing 👍',
          userName: 'Social User',
          userAvatar: null,
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        },
        {
          id: '2', 
          content: 'This is exactly what I was looking for!',
          userName: 'Content Explorer',
          userAvatar: null,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        }
      ];
      
      try {
        const realComments = await getPostComments(postId);
        setComments(realComments || mockComments);
      } catch (err) {
        console.warn('Backend not ready, using mock comments:', err.message);
        setComments(mockComments);
      }
    } catch (err) {
      setError('Failed to load comments');
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [postId, showComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setSubmitting(true);
    try {
      const optimisticComment = {
        id: 'temp-' + Date.now(),
        content: newComment.trim(),
        userName: user.fullName || user.username,
        userAvatar: user.avatar,
        createdAt: new Date().toISOString(),
      };
      
      setComments(prev => [optimisticComment, ...prev]);
      setNewComment('');
      
      try {
        await addCommentToPost(postId, newComment.trim());
        setTimeout(loadComments, 500);
      } catch (err) {
        console.warn('Backend call failed, keeping optimistic update:', err.message);
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
      setComments(prev => prev.filter(c => !c.id.startsWith('temp-')));
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className={`post-comments ${className}`}>
      {/* Comments Toggle Button */}
      <button
        className="btn btn-outline-primary mb-3 d-flex align-items-center"
        onClick={() => setShowComments(!showComments)}
      >
        <FaComment className="me-2" />
        {showComments ? 'Hide' : 'Show'} Comments ({comments.length})
      </button>

      {showComments && (
        <div className="comments-section">
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="comment-form mb-4">
              <div className="d-flex gap-3 align-items-start">
                <UserAvatar user={user} size={40} />
                <div className="flex-grow-1">
                  <div className="input-group">
                    <textarea
                      className="form-control"
                      rows="2"
                      placeholder="Share your thoughts on this post..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      disabled={submitting}
                      style={{ resize: 'none' }}
                    />
                    <button
                      type="submit"
                      className="btn btn-primary px-3"
                      disabled={!newComment.trim() || submitting}
                    >
                      {submitting ? (
                        <span className="spinner-border spinner-border-sm" />
                      ) : (
                        <FaPaperPlane />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="alert alert-info mb-4 d-flex align-items-center">
              <FaComment className="me-2" />
              Please login to comment on this post
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary mb-2" />
              <div className="text-muted">Loading comments...</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">
              <strong>Error:</strong> {error}
            </div>
          ) : comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item mb-3 p-3">
                  <div className="d-flex gap-3 align-items-start">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {comment.userAvatar ? (
                        <img 
                          src={comment.userAvatar} 
                          alt={comment.userName}
                          className="rounded-circle"
                          style={{ width: '36px', height: '36px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div 
                          className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
                          style={{ width: '36px', height: '36px' }}
                        >
                          <FaUser size={16} />
                        </div>
                      )}
                    </div>
                    
                    {/* Comment Content */}
                    <div className="flex-grow-1">
                      <div className="comment-header mb-2">
                        <span className="fw-medium text-primary me-2">
                          {comment.userName || comment.user?.fullName || comment.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-muted small">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>
                      
                      <div className="comment-content mb-3">
                        <p className="mb-0">{comment.content}</p>
                      </div>
                      
                      <div className="comment-actions d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                          <FaHeart size={12} className="me-1" />
                          Like
                        </button>
                        <button className="btn btn-sm btn-outline-secondary d-flex align-items-center">
                          <FaReply size={12} className="me-1" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-5">
              <FaNewspaper size={48} className="text-muted mb-3 opacity-50" />
              <h6 className="text-muted">No comments yet</h6>
              <p className="text-muted small mb-0">
                Start the conversation by commenting on this post!
              </p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .comment-form textarea {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
        
        .comment-form button {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
        
        .comment-item {
          border-radius: 12px;
          background-color: #f8f9fa;
          border: 1px solid #e9ecef;
          transition: all 0.2s ease;
        }
        
        .comment-item:hover {
          background-color: #f0f0f0;
          border-color: #dee2e6;
        }
        
        .comment-actions button {
          font-size: 0.8rem;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }
        
        .comments-section {
          border-top: 2px solid #e9ecef;
          padding-top: 1.5rem;
        }
        
        .comment-content p {
          line-height: 1.5;
          color: #495057;
        }
      `}</style>
    </div>
  );
}

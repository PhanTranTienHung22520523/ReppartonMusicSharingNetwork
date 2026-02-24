import { useState, useEffect, useCallback } from 'react';
import { FaComment, FaReply, FaPaperPlane, FaHeart, FaEllipsisV, FaTrash, FaEdit } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { deleteComment, likeComment, addReplyToComment } from '../api/commentService';
import UserAvatar from './UserAvatar';

function normalizeCommentsResponse(response) {
  if (Array.isArray(response)) return response;
  if (response && Array.isArray(response.content)) return response.content;
  return [];
}

export default function EnhancedCommentSection({
  type, // 'song', 'post', 'playlist'
  entityId,
  getComments,
  addComment,
  className = '',
  defaultExpanded = false
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showComments, setShowComments] = useState(defaultExpanded);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!commentId || !user) return;

    // Optimistic toggle (server will reconcile):
    // - if liked => unlike (likes -1)
    // - else => like (likes +1)
    const prevComment = comments.find((c) => c?.id === commentId);
    const wasLiked = Boolean(prevComment?.liked);
    setComments((prev) => prev.map((c) => {
      if (c?.id !== commentId) return c;
      const nextLikes = Math.max(0, (c.likes || 0) + (wasLiked ? -1 : 1));
      return { ...c, liked: !wasLiked, likes: nextLikes };
    }));

    try {
      const res = await likeComment(commentId);
      const updated = res?.comment;
      if (updated?.id) {
        setComments((prev) => prev.map((c) => (c?.id === updated.id ? { ...c, ...updated } : c)));
      } else {
        await loadComments();
      }
    } catch (err) {
      console.error('Failed to like comment:', err);
      // Don't show alert for like errors as they're less critical

      // Rollback optimistic toggle
      setComments((prev) => prev.map((c) => {
        if (c?.id !== commentId) return c;
        return {
          ...c,
          liked: wasLiked,
          likes: Math.max(0, (c.likes || 0) + (wasLiked ? 1 : -1)),
        };
      }));
    }
  };

  const loadComments = useCallback(async () => {
    if (!showComments || !entityId) return;

    setLoading(true);
    setError('');
    try {
      const response = await getComments(entityId);
      setComments(normalizeCommentsResponse(response));
    } catch (err) {
      setError('Failed to load comments');
      console.error('Failed to load comments:', err);
    } finally {
      setLoading(false);
    }
  }, [entityId, showComments, getComments]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      await addComment(entityId, newComment.trim());
      setNewComment('');
      await loadComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !user || submitting) return;

    setSubmitting(true);
    try {
      await addReplyToComment(replyingTo, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      await loadComments();
    } catch (err) {
      console.error('Failed to add reply:', err);
      alert('Failed to add reply. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getTypeIcon = () => {
    switch (type) {
      case 'song': return FaComment;
      case 'post': return FaComment;
      case 'playlist': return FaComment;
      default: return FaComment;
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
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const TypeIcon = getTypeIcon();

  const topLevelComments = comments.filter((c) => !c?.parentId);
  const repliesByParentId = comments.reduce((acc, c) => {
    if (c?.parentId) {
      (acc[c.parentId] ||= []).push(c);
    }
    return acc;
  }, {});

  return (
    <div className={`comment-section ${className}`}>
      {/* Toggle Comments Button */}
      <div className="d-flex align-items-center mb-3">
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
          onClick={() => setShowComments(!showComments)}
        >
          <TypeIcon size={16} />
          <span>{showComments ? 'Hide' : 'Show'} Comments ({comments.length})</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-container">
          {/* Add Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className="mb-4">
              <div className="d-flex gap-3 align-items-start">
                <UserAvatar
                  user={user}
                  size={40}
                  className="flex-shrink-0"
                />
                <div className="flex-grow-1">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder={`Add a comment to this ${type}...`}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    disabled={submitting}
                  />
                  <div className="d-flex justify-content-end mt-2">
                    <button
                      type="submit"
                      className={`btn btn-primary btn-sm d-flex align-items-center gap-2 ${submitting ? 'disabled' : ''}`}
                      disabled={!newComment.trim() || submitting}
                    >
                      <FaPaperPlane size={12} />
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="alert alert-info mb-4">
              Please log in to add comments.
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <div className="mt-2">Loading comments...</div>
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : topLevelComments.length === 0 ? (
            <div className="text-center text-muted py-4">
              <TypeIcon size={48} className="opacity-25 mb-3" />
              <div>No comments yet.</div>
              <div className="small">Be the first to comment on this {type}!</div>
            </div>
          ) : (
            <div className="comments-list">
              {topLevelComments.map((comment) => (
                <div key={comment.id} className="comment-item mb-4">
                  <div className="d-flex gap-3">
                    <Link
                      to={`/profile/${comment.userId || comment.userName}`}
                      className="text-decoration-none"
                    >
                      <UserAvatar
                        user={{
                          avatar: comment.userAvatar,
                          username: comment.userName
                        }}
                        size={40}
                        className="flex-shrink-0"
                        style={{ cursor: 'pointer' }}
                      />
                    </Link>
                    <div className="flex-grow-1">
                      <div className="comment-header d-flex align-items-center gap-2 mb-2">
                        <Link
                          to={`/profile/${comment.userId || comment.userName}`}
                          className="text-decoration-none"
                        >
                          <strong className="comment-author" style={{ cursor: 'pointer', color: 'inherit' }}>
                            {comment.userName || 'Anonymous'}
                          </strong>
                        </Link>
                        <span className="text-muted small">
                          {formatTimeAgo(comment.createdAt)}
                        </span>
                      </div>

                      <div className="comment-content mb-3">
                        {comment.content}
                      </div>

                      <div className="comment-actions d-flex align-items-center gap-3">
                        <button
                          className="btn btn-link btn-sm p-0 text-muted d-flex align-items-center gap-1"
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          <FaReply size={12} />
                          Reply
                        </button>

                        <button
                          className={`btn btn-link btn-sm p-0 d-flex align-items-center gap-1 ${comment?.liked ? 'text-danger' : 'text-muted'}`}
                          onClick={() => handleLikeComment(comment.id)}
                        >
                          <FaHeart size={12} />
                          Like ({comment.likes || 0})
                        </button>

                        {/* Edit and Delete buttons for comment owner */}
                        {user && user.id === comment.userId && (
                          <div className="ms-auto">
                            <button
                              className="btn btn-link btn-sm p-0 text-muted"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <FaTrash size={12} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Reply Form */}
                      {replyingTo === comment.id && user && (
                        <div className="reply-form mt-3 ps-3 border-start">
                          <div className="d-flex gap-2 align-items-start">
                            <UserAvatar
                              user={user}
                              size={32}
                              className="flex-shrink-0"
                            />
                            <div className="flex-grow-1">
                              <textarea
                                className="form-control form-control-sm"
                                rows="2"
                                placeholder={`Reply to ${comment.userName}...`}
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                disabled={submitting}
                              />
                              <div className="d-flex justify-content-end gap-2 mt-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-secondary btn-sm"
                                  onClick={() => {
                                    setReplyingTo(null);
                                    setReplyText('');
                                  }}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleReply()}
                                  disabled={!replyText.trim() || submitting}
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Replies */}
                      {(repliesByParentId[comment.id] || []).length > 0 && (
                        <div className="replies mt-3 ps-3 border-start">
                          {(repliesByParentId[comment.id] || []).map((reply) => (
                            <div key={reply.id} className="reply-item mb-3">
                              <div className="d-flex gap-2">
                                <Link
                                  to={`/profile/${reply.userId || reply.userName}`}
                                  className="text-decoration-none"
                                >
                                  <UserAvatar
                                    user={{
                                      avatar: reply.userAvatar,
                                      username: reply.userName
                                    }}
                                    size={32}
                                    className="flex-shrink-0"
                                    style={{ cursor: 'pointer' }}
                                  />
                                </Link>
                                <div className="flex-grow-1">
                                  <div className="comment-header d-flex align-items-center gap-2 mb-1">
                                    <Link
                                      to={`/profile/${reply.userId || reply.userName}`}
                                      className="text-decoration-none"
                                    >
                                      <strong className="comment-author" style={{ cursor: 'pointer', color: 'inherit' }}>
                                        {reply.userName || 'Anonymous'}
                                      </strong>
                                    </Link>
                                    <span className="text-muted small">
                                      {formatTimeAgo(reply.createdAt)}
                                    </span>
                                  </div>
                                  <div className="comment-content mb-2">
                                    {reply.content}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .comment-section {
          border-top: 1px solid #dee2e6;
          padding-top: 1rem;
        }
        
        .comment-item {
          border-bottom: 1px solid #f8f9fa;
          padding-bottom: 1rem;
        }
        
        .comment-item:last-child {
          border-bottom: none;
        }
        
        .comment-content {
          line-height: 1.5;
          word-wrap: break-word;
        }
        
        .comment-actions button:hover {
          color: var(--bs-primary) !important;
        }
        
        .reply-form {
          background-color: #f8f9fa;
          border-radius: 0.375rem;
          padding: 1rem;
          margin-top: 0.5rem;
        }

        .replies {
          border-left-color: #e9ecef !important;
        }
      `}</style>
    </div>
  );
}

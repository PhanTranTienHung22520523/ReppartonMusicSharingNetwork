import { getPostComments, addCommentToPost } from '../api/commentService';
import EnhancedCommentSection from './EnhancedCommentSection';

export default function PostComments({ postId, className = '' }) {
  return (
    <EnhancedCommentSection
      type="post"
      entityId={postId}
      getComments={getPostComments}
      addComment={addCommentToPost}
      className={className}
    />
  );
}

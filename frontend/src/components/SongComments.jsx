import { getSongComments, addCommentToSong } from '../api/commentService';
import EnhancedCommentSection from './EnhancedCommentSection';

export default function SongComments({ songId, className = '' }) {
  return (
    <EnhancedCommentSection
      type="song"
      entityId={songId}
      getComments={getSongComments}
      addComment={addCommentToSong}
      className={className}
    />
  );
}

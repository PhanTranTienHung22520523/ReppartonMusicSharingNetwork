import { getPlaylistComments, addCommentToPlaylist } from '../api/commentService';
import EnhancedCommentSection from './EnhancedCommentSection';

export default function PlaylistComments({ playlistId, className = '' }) {
  return (
    <EnhancedCommentSection
      type="playlist"
      entityId={playlistId}
      getComments={getPlaylistComments}
      addComment={addCommentToPlaylist}
      className={className}
    />
  );
}

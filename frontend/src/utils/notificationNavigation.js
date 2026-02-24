function asLower(value) {
  return (value || "").toString().trim().toLowerCase();
}

export function getNotificationDestination(notification) {
  const type = asLower(notification?.type);
  const target = notification?.target != null ? String(notification.target) : null;
  const text = `${notification?.content || ""}`.toLowerCase();

  // Stories
  if (type === "story") {
    return {
      to: "/stories",
      state: target ? { openStoryId: target } : undefined,
    };
  }

  // Songs
  if (type === "new_music") {
    return {
      to: target ? `/listen/${encodeURIComponent(target)}` : "/discover",
    };
  }

  // Posts (post + like/share are post-service notifications)
  if (type === "post" || type === "like" || type === "share") {
    return {
      to: target ? `/posts/${encodeURIComponent(target)}` : "/",
    };
  }

  // Comments: referenceId points to the item (post/song/playlist)
  if (type === "comment" || type === "comment_reply" || type === "comment_like") {
    if (text.includes("playlist")) {
      return { to: target ? `/playlist/${encodeURIComponent(target)}` : "/playlist" };
    }
    if (text.includes("song")) {
      return { to: target ? `/listen/${encodeURIComponent(target)}` : "/discover" };
    }
    // Default: assume post
    return { to: target ? `/posts/${encodeURIComponent(target)}` : "/" };
  }

  // Follow can be user-follow or playlist-follow (both use type=follow)
  if (type === "follow") {
    if (text.includes("playlist")) {
      return { to: target ? `/playlist/${encodeURIComponent(target)}` : "/playlist" };
    }
    return { to: target ? `/profile/${encodeURIComponent(target)}` : "/profile" };
  }

  // Fallback
  return { to: "/notifications" };
}

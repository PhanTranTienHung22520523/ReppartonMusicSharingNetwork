import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const SOCIAL_API_URL = API_ENDPOINTS.social;
const LIKE_ENDPOINT = `${SOCIAL_API_URL}/like`;
const ITEM_TYPES = {
  POST: 'POST',
  SONG: 'SONG',
};

const buildQueryString = (params = {}) => new URLSearchParams(params).toString();

const likeItem = async (itemId, itemType) => {
  const res = await fetch(LIKE_ENDPOINT, {
    method: "POST",
    headers: createHeaders(true),
    body: JSON.stringify({ itemId, itemType }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to like item');
  }
  return data;
};

const unlikeItem = async (itemId, itemType) => {
  const params = buildQueryString({ itemId, itemType });
  const res = await fetch(`${LIKE_ENDPOINT}?${params}`, {
    method: "DELETE",
    headers: createHeaders(true),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to unlike item');
  }
  return { success: true };
};

const isItemLiked = async (itemId, itemType) => {
  const params = buildQueryString({ itemId, itemType });
  const res = await fetch(`${SOCIAL_API_URL}/is-liked?${params}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) {
    return false;
  }
  const data = await res.json();
  return Boolean(data.liked);
};

const fetchUserLikes = async (userId) => {
  const res = await fetch(`${SOCIAL_API_URL}/likes/user/${userId}`, {
    headers: createHeaders(true),
  });
  if (!res.ok) {
    throw new Error('Failed to fetch liked items');
  }
  return await res.json();
};

export const likePost = (postId) => likeItem(postId, ITEM_TYPES.POST);
export const unlikePost = (postId) => unlikeItem(postId, ITEM_TYPES.POST);
export const likeSong = (songId) => likeItem(songId, ITEM_TYPES.SONG);
export const unlikeSong = (songId) => unlikeItem(songId, ITEM_TYPES.SONG);

export async function getLikedPosts(userId) {
  const likes = await fetchUserLikes(userId);
  return likes.filter((like) => like.itemType?.toUpperCase() === ITEM_TYPES.POST);
}

export async function getLikedSongs(userId) {
  const likes = await fetchUserLikes(userId);
  return likes.filter((like) => like.itemType?.toUpperCase() === ITEM_TYPES.SONG);
}

export async function isPostLiked(postId, userId) {
  return isItemLiked(postId, ITEM_TYPES.POST);
}

export async function isSongLiked(songId, userId) {
  return isItemLiked(songId, ITEM_TYPES.SONG);
}

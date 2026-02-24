import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const SOCIAL_API_URL = API_ENDPOINTS.social;
const FOLLOW_ENDPOINT = `${SOCIAL_API_URL}/follow`;

const buildQueryString = (params = {}) => new URLSearchParams(params).toString();

export async function followUser(followerId, followingId) {
  const res = await fetch(FOLLOW_ENDPOINT, {
    method: "POST",
    headers: createHeaders(true),
    body: JSON.stringify({ followerId, followingId }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Failed to follow user");
  }
  return data;
}

export async function unfollowUser(followerId, followingId) {
  const params = buildQueryString({ followerId, followingId });
  const res = await fetch(`${FOLLOW_ENDPOINT}?${params}`, {
    method: "DELETE",
    headers: createHeaders(true),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || "Failed to unfollow user");
  }
  return { success: true };
}

export async function getFollowers(userId) {
  const res = await fetch(`${SOCIAL_API_URL}/followers/${userId}`, {
    // followers endpoint is public GET — avoid sending Authorization to prevent invalid-token 403
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch followers");
  }
  return await res.json();
}

export async function getFollowing(userId) {
  const res = await fetch(`${SOCIAL_API_URL}/following/${userId}`, {
    // following endpoint is public GET — avoid sending Authorization to prevent invalid-token 403
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch following list");
  }
  return await res.json();
}

export async function isFollowing(followerId, followingId) {
  const params = buildQueryString({ followerId, followingId });
  const res = await fetch(`${SOCIAL_API_URL}/is-following?${params}`, {
    // is-following is a public GET (gateway allows it) — don't attach Authorization here
    headers: createHeaders(false),
  });
  if (!res.ok) {
    return { isFollowing: false };
  }
  const data = await res.json();
  return { isFollowing: Boolean(data.following) };
}

export async function getFollowStats(userId) {
  const res = await fetch(`${SOCIAL_API_URL}/stats/${userId}`, {
    // stats is public GET — avoid sending Authorization header
    headers: createHeaders(false),
  });
  if (!res.ok) {
    throw new Error("Failed to fetch follow stats");
  }
  return await res.json();
}

export async function getSuggestedUsers() {
  console.warn('Suggestions endpoint is not supported by the current backend. Returning empty list.');
  return [];
}

import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const SOCIAL_API_URL = API_ENDPOINTS.social;

export async function getShareCountBySong(songId) {
  const params = new URLSearchParams({ itemId: songId, itemType: 'SONG' });
  const res = await fetch(`${SOCIAL_API_URL}/shares/count?${params.toString()}`);
  if (!res.ok) {
    throw new Error('Failed to load share count');
  }
  return await res.json();
}

export async function shareSong({ userId, songId, platform }) {
  const payload = {
    userId,
    itemId: songId,
    itemType: 'SONG',
    platform,
  };
  const res = await fetch(`${SOCIAL_API_URL}/share`, {
    method: 'POST',
    headers: createHeaders(true),
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Failed to share song');
  }
  return data;
}
import { API_ENDPOINTS, createHeaders } from '../config/api.config';

const API_URL = API_ENDPOINTS.songs;

const unwrapApiResponse = (payload) => {
  // Accept raw arrays/objects or ApiResponse wrapper: { success, data }
  if (payload && typeof payload === 'object' && 'data' in payload) return payload.data;
  return payload;
};

// Lấy danh sách bài hát nghe gần đây của user (với pagination)
export async function getRecentSongs(userId, limit = 10, page = 0) {
  try {
    // Listen history lives in analytics-service (via gateway): /api/analytics/listen-history/user/{userId}
    const historyUrl = `${API_ENDPOINTS.analytics}/listen-history/user/${encodeURIComponent(userId)}`;
    const res = await fetch(historyUrl, { headers: createHeaders(true) });

    if (res.status === 401 || res.status === 403) {
      return { success: false, data: [], message: 'Không có quyền truy cập. Vui lòng đăng nhập lại.' };
    }

    if (!res.ok) throw new Error("Lỗi lấy lịch sử nghe nhạc");

    const rawHistory = unwrapApiResponse(await res.json());
    const history = Array.isArray(rawHistory) ? rawHistory : [];

    // Build a unique, ordered list of songIds (most recent first)
    const seen = new Set();
    const orderedSongIds = [];
    for (const h of history) {
      const songId = String(h?.songId || '').trim();
      if (!songId || seen.has(songId)) continue;
      seen.add(songId);
      orderedSongIds.push(songId);
    }

    const start = page * limit;
    const pageIds = orderedSongIds.slice(start, start + limit);
    if (pageIds.length === 0) return { success: true, data: [] };

    // Hydrate songIds into Song objects
    const songs = await Promise.all(
      pageIds.map(async (songId) => {
        try {
          const songRes = await fetch(`${API_ENDPOINTS.songs}/${encodeURIComponent(songId)}`, {
            headers: createHeaders(false),
          });
          if (!songRes.ok) return null;
          const payload = await songRes.json();
          return unwrapApiResponse(payload);
        } catch {
          return null;
        }
      })
    );

    return { success: true, data: songs.filter(Boolean) };
  } catch (error) {
    console.error("Error fetching recent songs:", error);
    return { success: false, data: [] };
  }
}

// Lấy top bài hát mới nhất (sử dụng public endpoint)
export async function getNewestSongs() {
  try {
    const res = await fetch(`${API_URL}/public?page=0&size=20`);
    if (!res.ok) throw new Error("Lỗi lấy bài hát mới nhất");
    const data = await res.json();
    // Accept Spring Page JSON, ApiResponse wrapper, or raw array
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  } catch (error) {
    console.error("Error fetching newest songs:", error);
    return [];
  }
}

// Lấy top bài hát nhiều view nhất (sử dụng trending endpoint)
export async function getMostViewedSongs() {
  try {
    const res = await fetch(`${API_URL}/trending?limit=10`);
    if (!res.ok) throw new Error("Lỗi lấy bài hát nhiều view nhất");
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.content)) return data.content;
    return data?.success ? (data.data || []) : [];
  } catch (error) {
    console.error("Error fetching most viewed songs:", error);
    return [];
  }
}
import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.songs;

// Lấy danh sách bài hát nghe gần đây của user (với pagination)
export async function getRecentSongs(userId, limit = 10, page = 0) {
  try {
    const res = await fetch(`${API_URL}/recent/${userId}?limit=${limit}&page=${page}`);
    if (!res.ok) throw new Error("Lỗi lấy bài hát nghe gần đây");
    const data = await res.json();
    return data.success ? data : { success: false, data: [] };
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
    return data.content || [];
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
    return data.success ? data.data : [];
  } catch (error) {
    console.error("Error fetching most viewed songs:", error);
    return [];
  }
}
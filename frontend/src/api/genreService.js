import { API_ENDPOINTS } from '../config/api.config';

const API_URL = API_ENDPOINTS.genres;

export async function getAllGenres() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Lỗi lấy genre");
  const data = await res.json();
  // Support both raw list and ApiResponse wrapper: { success, message, data: [...] }
  return data?.data ?? data;
}
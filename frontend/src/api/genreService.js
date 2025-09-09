const API_URL = `${import.meta.env.VITE_API_BASE_URL}/genres`;

export async function getAllGenres() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Lỗi lấy genre");
  return res.json(); // [{id, name, ...}]
}
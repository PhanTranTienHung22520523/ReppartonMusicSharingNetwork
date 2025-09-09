const API_URL = `${import.meta.env.VITE_API_BASE_URL}/shares`;

export async function getShareCountBySong(songId) {
  const res = await fetch(`${API_URL}/song/${songId}`);
  if (!res.ok) throw new Error("Lỗi lấy số share");
  return res.json(); // [{...}]
}

export async function shareSong({ userId, songId, platform }) {
  const params = new URLSearchParams({ userId, songId, platform });
  const res = await fetch(`${API_URL}?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error("Lỗi share bài hát");
  return res.json();
}
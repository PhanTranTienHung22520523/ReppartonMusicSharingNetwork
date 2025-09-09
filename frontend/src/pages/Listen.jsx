import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import MainLayout from "../components/MainLayout";
import { useEffect, useState } from "react";
import { getShareCountBySong, shareSong } from "../api/shareService";
import { useAuth } from "../contexts/AuthContext";
import CommentSection from "../components/CommentSection";

export default function Listen() {
  const { currentSong } = useMusicPlayer();
  const { user } = useAuth();
  const [shareCount, setShareCount] = useState(0);

  useEffect(() => {
    if (currentSong) {
      getShareCountBySong(currentSong.id)
        .then(data => setShareCount(Array.isArray(data) ? data.length : data.count || 0))
        .catch(() => setShareCount(0));
    }
  }, [currentSong]);

  const handleShare = async () => {
    if (!user || !currentSong) return;
    await shareSong({ userId: user.id, songId: currentSong.id, platform: "web" });
    getShareCountBySong(currentSong.id)
      .then(data => setShareCount(Array.isArray(data) ? data.length : data.count || 0));
    alert("Đã chia sẻ bài hát!");
  };

  if (!currentSong) return <MainLayout><div>Chưa chọn bài hát nào.</div></MainLayout>;

  return (
    <MainLayout>
      <div className="row justify-content-center">
        {/* Cột trái: Thông tin bài hát */}
        <div className="col-md-7 d-flex flex-column align-items-center">
          <img src={currentSong.coverUrl} alt="cover" style={{ width: 320, height: 320, borderRadius: 24, objectFit: "cover", boxShadow: "0 8px 32px rgba(111,66,193,0.12)" }} />
          <div className="fw-bold fs-2 mt-4">{currentSong.title}</div>
          <div className="text-muted mb-3">{currentSong.artist?.username || currentSong.artistName}</div>
          <div className="d-flex gap-4 mt-2">
            <span><i className="bi bi-headphones me-1"></i>{currentSong.views || 0} lượt nghe</span>
            <span><i className="bi bi-clock me-1"></i>{currentSong.createdAt ? new Date(currentSong.createdAt).toLocaleDateString() : ""}</span>
            <span>
              <button className="btn btn-light btn-sm" onClick={handleShare} title="Chia sẻ">
                <i className="bi bi-share"></i>
              </button>
              <span className="ms-1">{shareCount} lượt chia sẻ</span>
            </span>
          </div>
          <div className="mt-4">{currentSong.description}</div>
        </div>
        {/* Cột phải: Comment */}
        <div className="col-md-4">
          <div className="card p-3 shadow-sm" style={{ borderRadius: 18, minHeight: 400 }}>
            <CommentSection songId={currentSong.id} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
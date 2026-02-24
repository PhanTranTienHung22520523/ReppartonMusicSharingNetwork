import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getLyrics, 
  getSyncedLyrics, 
  updateLyrics, 
  extractLyrics, 
  syncLyrics 
} from "../api/aiService";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import { FaArrowLeft, FaMagic, FaClock, FaEdit, FaSave, FaTimes } from "react-icons/fa";

export default function SongLyrics() {
  const { songId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [lyrics, setLyrics] = useState("");
  const [syncedLyrics, setSyncedLyrics] = useState([]);
  const [editedLyrics, setEditedLyrics] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadLyrics();
  }, [songId]);

  const loadLyrics = async () => {
    setLoading(true);
    setError("");
    try {
      const [lyricsRes, syncedRes] = await Promise.all([
        getLyrics(songId).catch(() => ({ data: "" })),
        getSyncedLyrics(songId).catch(() => ({ data: [] }))
      ]);
      
      setLyrics(lyricsRes.data || "");
      setSyncedLyrics(syncedRes.data || []);
      setEditedLyrics(lyricsRes.data || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractLyrics = async () => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const response = await extractLyrics(songId);
      if (response.success) {
        setLyrics(response.data.lyrics || "");
        setEditedLyrics(response.data.lyrics || "");
        setSyncedLyrics(response.data.syncedLyrics || []);
        setSuccess("Đã trích xuất lời bài hát bằng AI!");
      }
    } catch (err) {
      setError("Trích xuất lời thất bại: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSyncLyrics = async () => {
    if (!lyrics) {
      setError("Vui lòng nhập lời bài hát trước khi đồng bộ");
      return;
    }
    
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const response = await syncLyrics(songId);
      if (response.success) {
        setSyncedLyrics(response.data.syncedLyrics || []);
        setSuccess("Đã đồng bộ lời với audio!");
      }
    } catch (err) {
      setError("Đồng bộ lời thất bại: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveLyrics = async () => {
    setProcessing(true);
    setError("");
    setSuccess("");
    try {
      const response = await updateLyrics(songId, editedLyrics);
      if (response.success) {
        setLyrics(editedLyrics);
        setIsEditing(false);
        setSuccess("Đã lưu lời bài hát!");
      }
    } catch (err) {
      setError("Lưu lời thất bại: " + err.message);
    } finally {
      setProcessing(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="min-vh-100 bg-light">
        <Navbar />
        <div className="text-center py-5" style={{ marginTop: "100px" }}>
          <div className="spinner-border" role="status" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />
      
      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        {/* Header */}
        <div className="d-flex align-items-center mb-4">
          <button
            className="btn btn-light me-3"
            onClick={() => navigate(-1)}
          >
            <FaArrowLeft />
          </button>
          <h2 className="mb-0">Quản lý Lời Bài Hát</h2>
        </div>

        {/* Error/Success Messages */}
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Action Buttons */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <button
                  className="btn btn-primary w-100"
                  onClick={handleExtractLyrics}
                  disabled={processing}
                >
                  <FaMagic className="me-2" />
                  {processing ? "Đang trích xuất..." : "Trích xuất lời bằng AI"}
                </button>
              </div>
              <div className="col-md-4">
                <button
                  className="btn btn-info w-100"
                  onClick={handleSyncLyrics}
                  disabled={processing || !lyrics}
                >
                  <FaClock className="me-2" />
                  {processing ? "Đang đồng bộ..." : "Đồng bộ với Audio"}
                </button>
              </div>
              <div className="col-md-4">
                {isEditing ? (
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-success flex-fill"
                      onClick={handleSaveLyrics}
                      disabled={processing}
                    >
                      <FaSave className="me-2" />
                      Lưu
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setIsEditing(false);
                        setEditedLyrics(lyrics);
                      }}
                      disabled={processing}
                    >
                      <FaTimes />
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-outline-primary w-100"
                    onClick={() => setIsEditing(true)}
                  >
                    <FaEdit className="me-2" />
                    Chỉnh sửa
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Lyrics Editor/Viewer */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">Lời Bài Hát</h5>
              </div>
              <div className="card-body">
                {isEditing ? (
                  <textarea
                    className="form-control"
                    rows="20"
                    value={editedLyrics}
                    onChange={(e) => setEditedLyrics(e.target.value)}
                    placeholder="Nhập lời bài hát..."
                    style={{ fontFamily: "monospace" }}
                  />
                ) : lyrics ? (
                  <pre
                    className="mb-0"
                    style={{
                      whiteSpace: "pre-wrap",
                      fontFamily: "inherit",
                      fontSize: "1rem",
                      lineHeight: 1.8
                    }}
                  >
                    {lyrics}
                  </pre>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>Chưa có lời bài hát</p>
                    <p className="small">Sử dụng AI để trích xuất tự động hoặc nhập thủ công</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synced Lyrics Timeline */}
          <div className="col-md-6">
            <div className="card h-100">
              <div className="card-header">
                <h5 className="mb-0">
                  <FaClock className="me-2" />
                  Lời Đồng Bộ (Synced Lyrics)
                </h5>
              </div>
              <div className="card-body" style={{ maxHeight: "600px", overflowY: "auto" }}>
                {syncedLyrics.length > 0 ? (
                  <div className="list-group list-group-flush">
                    {syncedLyrics.map((line, idx) => (
                      <div
                        key={idx}
                        className="list-group-item d-flex align-items-start"
                        style={{ border: "none", borderBottom: "1px solid #eee" }}
                      >
                        <span
                          className="badge bg-primary me-3"
                          style={{ minWidth: "50px", fontSize: "0.85rem" }}
                        >
                          {formatTime(line.timestamp)}
                        </span>
                        <span style={{ flex: 1, lineHeight: 1.8 }}>
                          {line.text}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <FaClock size={48} className="mb-3 opacity-25" />
                    <p>Chưa có lời đồng bộ</p>
                    <p className="small">
                      Nhập lời bài hát rồi nhấn "Đồng bộ với Audio" để AI tự động tạo timestamp
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="alert alert-info mt-4">
          <h6 className="alert-heading">
            <FaMagic className="me-2" />
            Tính năng AI
          </h6>
          <ul className="mb-0 small">
            <li><strong>Trích xuất lời:</strong> AI sẽ phân tích audio và tự động nhận dạng lời bài hát</li>
            <li><strong>Đồng bộ:</strong> AI tạo timestamp cho từng câu lời để hiển thị đúng thời điểm khi phát nhạc</li>
            <li><strong>Chỉnh sửa:</strong> Bạn có thể tự chỉnh sửa lời bài hát nếu AI nhận dạng chưa chính xác</li>
          </ul>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}

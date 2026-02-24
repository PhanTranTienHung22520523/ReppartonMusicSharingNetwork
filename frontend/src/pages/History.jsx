import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import { FaClock, FaPlay, FaHeart, FaShare } from "react-icons/fa";
import * as analyticsApi from "../api/analyticsService";
import { getSongById } from "../api/songService";

export default function History() {
  const { user } = useAuth();
  const [listenHistory, setListenHistory] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("listen");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadHistory();
  }, [activeTab]);

  const loadHistory = async () => {
    try {
      setError("");
      if (!user?.id) {
        setListenHistory([]);
        setSearchHistory([]);
        return;
      }

      if (activeTab === "listen") {
        const raw = await analyticsApi.getUserListenHistory(user.id);

        // Enrich with song details (best-effort, cached per load)
        const uniqueSongIds = Array.from(new Set((raw || []).map((h) => h.songId).filter(Boolean)));
        const songMap = new Map();
        await Promise.all(
          uniqueSongIds.map(async (songId) => {
            try {
              const song = await getSongById(songId);
              songMap.set(songId, song);
            } catch {
              // Ignore enrichment failures
            }
          })
        );

        const items = (raw || []).map((h) => {
          const song = songMap.get(h.songId);
          return {
            id: h.id,
            song: {
              id: h.songId,
              title: song?.title || h.songId,
              artist: song?.artistName || song?.artist || h.artistId || "",
              duration: song?.duration || song?.durationSeconds || "",
              coverUrl: song?.coverUrl || song?.imageUrl || "",
            },
            playedAt: h.createdAt,
            completed: true,
          };
        });
        setListenHistory(items);
      } else {
        const raw = await analyticsApi.getUserSearchHistory(user.id);
        const items = (raw || []).map((h) => ({
          id: h.id,
          query: h.searchQuery,
          timestamp: h.searchedAt,
          results: null,
        }));
        setSearchHistory(items);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
      setError(error?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return "Yesterday";
    return `${diffInDays} days ago`;
  };

  const clearHistory = () => {
    alert("Chưa hỗ trợ xoá lịch sử trên server.");
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="history-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold" style={{ color: "var(--text-color)" }}>
            <FaClock className="me-2" />
            History
          </h1>
          <button className="btn btn-outline-danger" onClick={clearHistory}>
            Clear History
          </button>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "listen" ? "active" : ""}`}
              onClick={() => setActiveTab("listen")}
            >
              <FaPlay className="me-2" />
              Listen History
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "search" ? "active" : ""}`}
              onClick={() => setActiveTab("search")}
            >
              <i className="bi bi-search me-2"></i>
              Search History
            </button>
          </li>
        </ul>

        {/* Listen History */}
        {activeTab === "listen" && (
          <div>
            {listenHistory.length === 0 ? (
              <div className="text-center py-5">
                <FaPlay style={{ fontSize: 64, color: "var(--text-muted)", marginBottom: 16 }} />
                <h5 style={{ color: "var(--text-muted)" }}>No listen history yet</h5>
                <p style={{ color: "var(--text-muted)" }}>Start listening to music to see your history here</p>
              </div>
            ) : (
              <div className="list-group">
                {listenHistory.map((item) => (
                  <div
                    key={item.id}
                    className="list-group-item d-flex align-items-center"
                    style={{
                      background: "var(--card-color)",
                      border: "1px solid var(--border-color)",
                      marginBottom: 12,
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    {/* Album Cover */}
                    <div
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                        background: "var(--primary-gradient)",
                        marginRight: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="bi bi-music-note-beamed" style={{ fontSize: 24, color: "white" }}></i>
                    </div>

                    {/* Song Info */}
                    <div className="flex-grow-1">
                      <h6 className="mb-1" style={{ color: "var(--text-color)" }}>
                        {item.song.title}
                      </h6>
                      <div style={{ color: "var(--text-muted)", fontSize: 14 }}>
                        {item.song.artist}{item.song.duration ? ` • ${item.song.duration}` : ""}
                      </div>
                      <small style={{ color: "var(--text-muted)" }}>
                        {formatTimeAgo(item.playedAt)}
                        {item.completed && " • Completed"}
                      </small>
                    </div>

                    {/* Actions */}
                    <div className="d-flex gap-2">
                      <button className="btn btn-icon" title="Play">
                        <FaPlay style={{ color: "var(--primary-color)" }} />
                      </button>
                      <button className="btn btn-icon" title="Like">
                        <FaHeart style={{ color: "var(--text-muted)" }} />
                      </button>
                      <button className="btn btn-icon" title="Share">
                        <FaShare style={{ color: "var(--text-muted)" }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search History */}
        {activeTab === "search" && (
          <div>
            {searchHistory.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search" style={{ fontSize: 64, color: "var(--text-muted)", marginBottom: 16 }}></i>
                <h5 style={{ color: "var(--text-muted)" }}>No search history yet</h5>
                <p style={{ color: "var(--text-muted)" }}>Your searches will appear here</p>
              </div>
            ) : (
              <div className="list-group">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="list-group-item d-flex align-items-center justify-content-between"
                    style={{
                      background: "var(--card-color)",
                      border: "1px solid var(--border-color)",
                      marginBottom: 12,
                      borderRadius: 12,
                      padding: 16,
                      cursor: "pointer",
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <i
                        className="bi bi-search me-3"
                        style={{ fontSize: 20, color: "var(--text-muted)" }}
                      ></i>
                      <div>
                        <h6 className="mb-1" style={{ color: "var(--text-color)" }}>
                          {item.query}
                        </h6>
                        <small style={{ color: "var(--text-muted)" }}>
                          {formatTimeAgo(item.timestamp)} • {item.results} results
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to search with this query
                      }}
                    >
                      Search Again
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

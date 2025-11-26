import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import { FaChartLine, FaMusic, FaUsers, FaPlay, FaSearch } from "react-icons/fa";
import * as analyticsApi from "../api/analyticsService";

export default function Analytics() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    totalPlays: 0,
    totalListeners: 0,
    topSongs: [],
    recentSearches: [],
    listenHistory: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    try {
      // Load real analytics from backend
      const [userAnalytics, topSongs, history, searches] = await Promise.all([
        analyticsApi.getUserAnalytics(timeRange).catch(() => ({ totalPlays: 0, totalListeners: 0 })),
        analyticsApi.getTopSongs(timeRange, 10).catch(() => []),
        analyticsApi.getListeningHistory(timeRange).catch(() => []),
        analyticsApi.getSearchAnalytics(timeRange).catch(() => [])
      ]);
      
      setAnalytics({
        totalPlays: userAnalytics.totalPlays || 0,
        totalListeners: userAnalytics.totalListeners || 0,
        topSongs: topSongs || [],
        recentSearches: searches || [],
        listenHistory: history || [],
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
      // Fallback to empty data on error
      setAnalytics({
        totalPlays: 0,
        totalListeners: 0,
        topSongs: [],
        recentSearches: [],
        listenHistory: [],
      });
    } finally {
      setLoading(false);
    }
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
      <div className="analytics-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="fw-bold" style={{ color: "var(--text-color)" }}>
            <FaChartLine className="me-2" />
            Analytics Dashboard
          </h1>
          <select
            className="form-select"
            style={{ width: 150 }}
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {/* Stats Cards */}
        <div className="row g-4 mb-4">
          <div className="col-md-6">
            <div
              className="card p-4"
              style={{
                background: "var(--primary-gradient)",
                color: "white",
                border: "none",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1 opacity-75">Total Plays</h6>
                  <h2 className="mb-0 fw-bold">{analytics.totalPlays.toLocaleString()}</h2>
                  <small className="opacity-75">+12.5% from last {timeRange}</small>
                </div>
                <FaPlay style={{ fontSize: 48, opacity: 0.5 }} />
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div
              className="card p-4"
              style={{
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "white",
                border: "none",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h6 className="mb-1 opacity-75">Total Listeners</h6>
                  <h2 className="mb-0 fw-bold">{analytics.totalListeners.toLocaleString()}</h2>
                  <small className="opacity-75">+8.3% from last {timeRange}</small>
                </div>
                <FaUsers style={{ fontSize: 48, opacity: 0.5 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="row g-4 mb-4">
          <div className="col-md-8">
            <div className="card p-4" style={{ background: "var(--card-color)", border: "1px solid var(--border-color)" }}>
              <h5 className="mb-3" style={{ color: "var(--text-color)" }}>Listen History</h5>
              <div style={{ height: 300, display: "flex", alignItems: "flex-end", gap: 16 }}>
                {analytics.listenHistory.map((item, index) => {
                  const maxPlays = Math.max(...analytics.listenHistory.map(h => h.plays));
                  const height = (item.plays / maxPlays) * 100;
                  return (
                    <div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div
                        style={{
                          width: "100%",
                          height: `${height}%`,
                          background: "var(--primary-gradient)",
                          borderRadius: "8px 8px 0 0",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        title={`${item.plays.toLocaleString()} plays`}
                      />
                      <small className="mt-2" style={{ color: "var(--text-muted)" }}>{item.date}</small>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card p-4" style={{ background: "var(--card-color)", border: "1px solid var(--border-color)" }}>
              <h5 className="mb-3" style={{ color: "var(--text-color)" }}>
                <FaSearch className="me-2" />
                Recent Searches
              </h5>
              <div className="list-group">
                {analytics.recentSearches.map((search, index) => (
                  <div
                    key={index}
                    className="list-group-item"
                    style={{
                      background: "var(--surface-color)",
                      border: "1px solid var(--border-color)",
                      marginBottom: 8,
                      borderRadius: 8,
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div style={{ color: "var(--text-color)", fontWeight: 500 }}>{search.query}</div>
                        <small style={{ color: "var(--text-muted)" }}>{search.timestamp}</small>
                      </div>
                      <span className="badge bg-primary">{search.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Songs */}
        <div className="card p-4" style={{ background: "var(--card-color)", border: "1px solid var(--border-color)" }}>
          <h5 className="mb-3" style={{ color: "var(--text-color)" }}>
            <FaMusic className="me-2" />
            Top Songs
          </h5>
          <div className="list-group">
            {analytics.topSongs.map((song, index) => (
              <div
                key={song.id}
                className="list-group-item d-flex align-items-center"
                style={{
                  background: "var(--surface-color)",
                  border: "1px solid var(--border-color)",
                  marginBottom: 8,
                  borderRadius: 8,
                }}
              >
                <span
                  className="me-3 fw-bold"
                  style={{
                    color: index < 3 ? "var(--primary-color)" : "var(--text-muted)",
                    fontSize: 20,
                    width: 40,
                  }}
                >
                  #{index + 1}
                </span>
                <div className="flex-grow-1">
                  <h6 className="mb-0" style={{ color: "var(--text-color)" }}>{song.title}</h6>
                  <small style={{ color: "var(--text-muted)" }}>{song.artist}</small>
                </div>
                <div className="text-end me-3">
                  <div style={{ color: "var(--text-color)", fontWeight: 600 }}>
                    {song.plays.toLocaleString()}
                  </div>
                  <small style={{ color: "var(--text-muted)" }}>plays</small>
                </div>
                <span
                  className={`badge ${song.growth > 0 ? "bg-success" : "bg-danger"}`}
                  style={{ minWidth: 60 }}
                >
                  {song.growth > 0 ? "+" : ""}{song.growth}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

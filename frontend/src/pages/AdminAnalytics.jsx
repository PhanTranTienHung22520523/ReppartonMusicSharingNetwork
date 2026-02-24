import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import { useAuth } from "../contexts/AuthContext";
import {
  getAdminJobState,
  getAdminTopArtistPlays,
  getAdminTopSearches,
  getAdminTopSongPlays,
  getAdminTopUserListens,
} from "../api/analyticsService";

function formatDateISO(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function AdminAnalytics() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = useMemo(() => new Date(), []);
  const defaultTo = useMemo(() => formatDateISO(today), [today]);
  const defaultFrom = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 6);
    return formatDateISO(d);
  }, [today]);

  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);
  const [limit, setLimit] = useState(20);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [topSongs, setTopSongs] = useState([]);
  const [topArtists, setTopArtists] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [topSearches, setTopSearches] = useState([]);
  const [jobState, setJobState] = useState([]);

  useEffect(() => {
    if (!user || (!user.roles?.includes("ADMIN") && user.role !== "ADMIN")) {
      navigate("/");
    }
  }, [user, navigate]);

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [songs, artists, users, searches, state] = await Promise.all([
        getAdminTopSongPlays({ from, to, limit }),
        getAdminTopArtistPlays({ from, to, limit }),
        getAdminTopUserListens({ from, to, limit }),
        getAdminTopSearches({ from, to, limit }),
        getAdminJobState(),
      ]);
      setTopSongs(songs);
      setTopArtists(artists);
      setTopUsers(users);
      setTopSearches(searches);
      setJobState(state);
    } catch (e) {
      setError(e?.message || "Failed to load admin analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-vh-100 bg-light">
      <Navbar />

      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2 className="mb-1">Admin Analytics</h2>
            <div className="text-muted small">Top metrics theo khoảng ngày</div>
          </div>
          <button className="btn btn-outline-secondary" onClick={() => navigate("/admin")}>Quay lại</button>
        </div>

        <div className="card mb-3">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label">Từ ngày</label>
                <input className="form-control" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Đến ngày</label>
                <input className="form-control" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <div className="col-md-2">
                <label className="form-label">Limit</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  max={200}
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value || 20))}
                />
              </div>
              <div className="col-md-4 d-flex gap-2">
                <button className="btn btn-primary" onClick={loadAll} disabled={loading}>
                  {loading ? "Đang tải..." : "Tải dữ liệu"}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={() => {
                    setFrom(defaultFrom);
                    setTo(defaultTo);
                    setLimit(20);
                  }}
                  disabled={loading}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-3">
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <strong>Top Songs (plays)</strong>
              </div>
              <div className="card-body">
                {topSongs?.length ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Song ID</th>
                          <th className="text-end">Plays</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSongs.map((r, idx) => (
                          <tr key={`${r.songId}-${idx}`}>
                            <td>{idx + 1}</td>
                            <td>{r.songId}</td>
                            <td className="text-end">{r.plays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <strong>Top Artists (plays)</strong>
              </div>
              <div className="card-body">
                {topArtists?.length ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Artist ID</th>
                          <th className="text-end">Plays</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topArtists.map((r, idx) => (
                          <tr key={`${r.artistId}-${idx}`}>
                            <td>{idx + 1}</td>
                            <td>{r.artistId}</td>
                            <td className="text-end">{r.plays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <strong>Top Users (listens)</strong>
              </div>
              <div className="card-body">
                {topUsers?.length ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>User ID</th>
                          <th className="text-end">Listens</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topUsers.map((r, idx) => (
                          <tr key={`${r.userId}-${idx}`}>
                            <td>{idx + 1}</td>
                            <td>{r.userId}</td>
                            <td className="text-end">{r.listens}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <strong>Top Searches</strong>
              </div>
              <div className="card-body">
                {topSearches?.length ? (
                  <div className="table-responsive">
                    <table className="table table-sm mb-0">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Query</th>
                          <th className="text-end">Searches</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topSearches.map((r, idx) => (
                          <tr key={`${r.searchQuery}-${idx}`}>
                            <td>{idx + 1}</td>
                            <td>{r.searchQuery}</td>
                            <td className="text-end">{r.searches}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-muted">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="card">
              <div className="card-header">
                <strong>Job State</strong>
              </div>
              <div className="card-body">
                {jobState?.length ? (
                  <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(jobState, null, 2)}</pre>
                ) : (
                  <div className="text-muted">Không có dữ liệu</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}

import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import MainLayout from "../components/MainLayout";
import SearchResults from "../components/SearchResults";
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  getRecentSongs,
  getNewestSongs,
  getMostViewedSongs,
} from "../api/discoverService";
import { getSongsByKey, getSongsByMood, getSongsByTempo } from "../api/aiService";

import SongCard from "../components/SongCard";

export default function Discover() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const [recent, setRecent] = useState([]);
  const [newest, setNewest] = useState([]);
  const [mostViewed, setMostViewed] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // AI Filters
  const [showFilters, setShowFilters] = useState(false);
  const [selectedKey, setSelectedKey] = useState("");
  const [selectedMood, setSelectedMood] = useState("");
  const [tempoRange, setTempoRange] = useState({ min: 60, max: 200 });
  const [tempoInputs, setTempoInputs] = useState({ min: "60", max: "200" });
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);

  const TEMPO_MIN = 60;
  const TEMPO_MAX = 200;

  const clampNumber = (value, min, max) => Math.max(min, Math.min(max, value));

  const updateTempoRange = (part, rawValue) => {
    setTempoRange((prev) => {
      const parsed = typeof rawValue === "number" ? rawValue : parseInt(rawValue, 10);
      if (Number.isNaN(parsed)) return prev;

      const nextValue = clampNumber(parsed, TEMPO_MIN, TEMPO_MAX);
      let min = prev.min;
      let max = prev.max;

      if (part === "min") {
        min = nextValue;
        if (min > max) max = min;
      } else {
        max = nextValue;
        if (max < min) min = max;
      }

      return { min, max };
    });
  };

  useEffect(() => {
    setTempoInputs({ min: String(tempoRange.min), max: String(tempoRange.max) });
  }, [tempoRange.min, tempoRange.max]);

  const handleTempoInputChange = (part, value) => {
    setTempoInputs((prev) => ({ ...prev, [part]: value }));
    if (value === "") return;
    const parsed = parseInt(value, 10);
    if (!Number.isNaN(parsed)) updateTempoRange(part, parsed);
  };

  const handleTempoInputBlur = (part) => {
    const value = (tempoInputs[part] ?? "").trim();
    if (value === "") {
      setTempoInputs((prev) => ({ ...prev, [part]: String(tempoRange[part]) }));
      return;
    }
    updateTempoRange(part, value);
  };

  const keys = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  const moods = ["happy", "sad", "energetic", "calm", "romantic", "angry", "melancholic", "uplifting"];

  // Mock data for fallback
  const MOCK_SONGS = [
    { id: 101, title: "Midnight City", artist: { name: "M83" }, coverUrl: "https://picsum.photos/200?random=1", duration: 243 },
    { id: 102, title: "Starboy", artist: { name: "The Weeknd" }, coverUrl: "https://picsum.photos/200?random=2", duration: 230 },
    { id: 103, title: "Levitating", artist: { name: "Dua Lipa" }, coverUrl: "https://picsum.photos/200?random=3", duration: 203 },
    { id: 104, title: "Save Your Tears", artist: { name: "The Weeknd" }, coverUrl: "https://picsum.photos/200?random=4", duration: 215 },
    { id: 105, title: "Peaches", artist: { name: "Justin Bieber" }, coverUrl: "https://picsum.photos/200?random=5", duration: 198 },
  ];

  const uniqueRecent = recent.filter(
    (song, idx, arr) => arr.findIndex(s => s.id === song.id) === idx
  );

  useEffect(() => {
    setLoading(true);
    const promises = [
      getNewestSongs().then(data => setNewest(data && data.length > 0 ? data : MOCK_SONGS)).catch(() => setNewest(MOCK_SONGS)),
      getMostViewedSongs().then(data => setMostViewed(data && data.length > 0 ? data : MOCK_SONGS)).catch(() => setMostViewed(MOCK_SONGS)),
    ];
    if (user) {
      promises.push(getRecentSongs(user.id, 5).then(response => {
        setRecent(response.success && response.data.length > 0 ? response.data : MOCK_SONGS.slice(0, 3));
      }).catch(() => setRecent(MOCK_SONGS.slice(0, 3))));
    } else {
      // If not logged in, fill recent with some mock data just for display or leave empty
      setRecent(MOCK_SONGS.slice(0, 3));
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [user]);

  const handleApplyFilters = async () => {
    setFilterLoading(true);
    try {
      let results = [];
      
      if (selectedKey) {
        const response = await getSongsByKey(selectedKey);
        results = response.data || [];
      } else if (selectedMood) {
        const response = await getSongsByMood(selectedMood);
        results = response.data || [];
      } else {
        const response = await getSongsByTempo(tempoRange.min, tempoRange.max);
        results = response.data || [];
      }
      
      setFilteredSongs(results);
    } catch (error) {
      console.error("Filter error:", error);
      setFilteredSongs([]);
    } finally {
      setFilterLoading(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedKey("");
    setSelectedMood("");
    setTempoRange({ min: 60, max: 200 });
    setFilteredSongs([]);
  };

  // If there's a search query, show search results
  if (searchQuery) {
    return (
      <MainLayout>
        <SearchResults />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0">{t("discover.title")}</h3>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowFilters(!showFilters)}
        >
          <i className="bi bi-funnel me-2"></i>
          AI Filters
        </button>
      </div>

      {/* AI Filters Panel */}
      {showFilters && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">
              <i className="bi bi-robot me-2"></i>
              Tìm bài hát bằng AI
            </h5>
            <div className="row g-3">
              {/* Key Filter */}
              <div className="col-md-4">
                <label className="form-label">Key (Tone nhạc)</label>
                <select
                  className="form-select"
                  value={selectedKey}
                  onChange={(e) => {
                    setSelectedKey(e.target.value);
                    setSelectedMood("");
                  }}
                >
                  <option value="">-- Chọn Key --</option>
                  {keys.map(key => (
                    <option key={key} value={key}>{key}</option>
                  ))}
                </select>
              </div>

              {/* Mood Filter */}
              <div className="col-md-4">
                <label className="form-label">Mood (Tâm trạng)</label>
                <select
                  className="form-select"
                  value={selectedMood}
                  onChange={(e) => {
                    setSelectedMood(e.target.value);
                    setSelectedKey("");
                  }}
                >
                  <option value="">-- Chọn Mood --</option>
                  {moods.map(mood => (
                    <option key={mood} value={mood}>
                      {mood.charAt(0).toUpperCase() + mood.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tempo Filter */}
              <div className="col-md-4">
                <label className="form-label">Tempo (BPM): {tempoRange.min} - {tempoRange.max}</label>
                <div className="d-flex align-items-center gap-2 mb-2">
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: 92 }}
                    min={TEMPO_MIN}
                    max={TEMPO_MAX}
                    step={1}
                    value={tempoInputs.min}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleTempoInputChange("min", e.target.value)}
                    onBlur={() => handleTempoInputBlur("min")}
                    aria-label="Tempo min"
                  />
                  <span className="text-muted" style={{ lineHeight: 1 }}>–</span>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    style={{ width: 92 }}
                    min={TEMPO_MIN}
                    max={TEMPO_MAX}
                    step={1}
                    value={tempoInputs.max}
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => handleTempoInputChange("max", e.target.value)}
                    onBlur={() => handleTempoInputBlur("max")}
                    aria-label="Tempo max"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 mt-3">
              <button
                className="btn btn-primary"
                onClick={handleApplyFilters}
                disabled={filterLoading || (!selectedKey && !selectedMood && tempoRange.min === 60 && tempoRange.max === 200)}
              >
                {filterLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang lọc...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Áp dụng
                  </>
                )}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={handleClearFilters}
              >
                <i className="bi bi-x-circle me-2"></i>
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filtered Results */}
      {filteredSongs.length > 0 && (
        <>
          <h5 className="fw-bold mt-4 mb-3">
            <i className="bi bi-funnel-fill me-2"></i>
            Kết quả lọc ({filteredSongs.length} bài hát)
          </h5>
          <div className="row g-4 mb-4">
            {filteredSongs.map(song => (
              <div className="col-md-4" key={song.id}>
                <SongCard song={song} />
              </div>
            ))}
          </div>
          <hr className="my-4" />
        </>
      )}

      {loading ? (
        <div>{t("common.loading")}</div>
      ) : (
        <>
          {user && (
            <>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="fw-bold mt-4 mb-3">🎵 {t("discover.recent")}</h5>
                {uniqueRecent.length > 0 && (
                  <Link to="/recent-songs" className="btn btn-outline-primary btn-sm">
                    {t("discover.viewAll")} →
                  </Link>
                )}
              </div>
              <div className="row g-4 mb-4">
                {uniqueRecent.length === 0 && <div className="text-muted ms-3">{t("discover.recent")} - {t("common.loading")}</div>}
                {uniqueRecent.slice(0, 5).map(song => (
                  <div className="col-md-4" key={song.id}>
                    <SongCard song={song} />
                  </div>
                ))}
              </div>
            </>
          )}

          <h5 className="fw-bold mt-4 mb-3">{t("discover.newest")}</h5>
          <div className="row g-4 mb-4">
            {newest.length === 0 && <div className="text-muted ms-3">{t("common.loading")}</div>}
            {newest.map(song => (
              <div className="col-md-4" key={song.id}>
                <SongCard song={song} />
              </div>
            ))}
          </div>

          <h5 className="fw-bold mt-4 mb-3">{t("discover.mostViewed")}</h5>
          <div className="row g-4 mb-4">
            {mostViewed.length === 0 && <div className="text-muted ms-3">{t("common.loading")}</div>}
            {mostViewed.map(song => (
              <div className="col-md-4" key={song.id}>
                <SongCard song={song} />
              </div>
            ))}
          </div>
        </>
      )}
    </MainLayout>
  );
}
import { useMusicPlayer } from "../contexts/MusicPlayerContext";
import { useLanguage } from "../contexts/LanguageContext";
import MainLayout from "../components/MainLayout";
import { useEffect, useState } from "react";
import { getShareCountBySong, shareSong } from "../api/shareService";
import { useAuth } from "../contexts/AuthContext";
import CommentSection from "../components/CommentSection";
import SongAIAnalysis from "../components/SongAIAnalysis";
import { getAIAnalysis, getChordAnalysis, analyzeChords, analyzeSong, getLyrics, getSyncedLyrics } from "../api/aiService";
import { getSongById } from "../api/songService";
import { getUserById } from "../api/userService";
import { useNavigate } from "react-router-dom";
import { fetchDurationFromUrl, normalizeSong, formatDuration as formatDur } from "../utils/songUtils";
import "./Listen.css";

export default function Listen() {
  const { currentSong, playing } = useMusicPlayer();
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [shareCount, setShareCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("cover");
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [chordAnalysis, setChordAnalysis] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "", type: "info" });
  const [lyrics, setLyrics] = useState("");
  const [syncedLyrics, setSyncedLyrics] = useState([]);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [songDetails, setSongDetails] = useState(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCaption, setShareCaption] = useState("");
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (currentSong) {
      getShareCountBySong(currentSong.id)
        .then(data => setShareCount(Array.isArray(data) ? data.length : data.count || 0))
        .catch(() => setShareCount(0));

      // Load AI analysis if available
      loadAIAnalysis();

      // Load lyrics (raw + synced)
      loadLyrics();

      // Hydrate song details (artist name, genre, etc.)
      hydrateSongDetails();

      // Extract duration from fileUrl if missing (Cloudinary import)
      if (!currentSong.duration && currentSong.fileUrl) {
        fetchDurationFromUrl(currentSong.fileUrl).then(dur => {
          if (dur) {
            setSongDetails(prev => prev ? { ...prev, duration: dur } : { ...currentSong, duration: dur });
          }
        });
      }

      // Default to cover when switching tracks
      setActiveTab("cover");
    }
  }, [currentSong]);

  const loadAIAnalysis = async () => {
    if (!currentSong) return;

    setLoadingAnalysis(true);
    try {
      // 1. Fetch main AI analysis (includes tempo, key, mood AND often chords)
      const analysisRes = await getAIAnalysis(currentSong.id).catch(() => null);
      if (analysisRes?.data) {
        const analysis = analysisRes.data;
        setAiAnalysis(analysis);

        // If chords are already part of this analysis, we don't need to fetch them separately
        if (analysis.chordAnalysis && analysis.chordAnalysis.chords?.length > 0) {
          setChordAnalysis(analysis.chordAnalysis);
          setLoadingAnalysis(false);
          return;
        }
      }

      // 2. If chords weren't in main analysis, try fetching them separately
      let chordRes = null;
      try {
        chordRes = await getChordAnalysis(currentSong.id);
      } catch (err) {
        // Only trigger analysis if it's actually missing (400) and we don't have it yet
        const status = err?.response?.status || null;
        if (status === 400 || /Bad Request/i.test(err?.message || "")) {
          // We don't trigger here anymore to avoid "buoc nay lam gi cho lau"
          // The backend should have handled it during upload.
          console.log("Chords not ready yet, skipping auto-trigger to minimize wait.");
        }
      }

      if (chordRes?.data) setChordAnalysis(chordRes.data);
    } catch (err) {
      console.error("Failed to load AI analysis:", err);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const handleManualAnalyze = async () => {
    if (!currentSong) return;
    setLoadingAnalysis(true);
    try {
      // Trigger full analysis (general + chords)
      await analyzeSong(currentSong.id).catch(() => null);
      // trigger compact dominant-only chord analysis first to get dominant loop persisted
      await analyzeChords(currentSong.id, true).catch(() => null);
      // also trigger full chord analysis in background
      await analyzeChords(currentSong.id).catch(() => null);

      // Wait briefly and re-fetch results
      await new Promise((r) => setTimeout(r, 1200));
      const analysisRes = await getAIAnalysis(currentSong.id).catch(() => null);
      const chordRes = await getChordAnalysis(currentSong.id).catch(() => null);

      if (analysisRes?.data) setAiAnalysis(analysisRes.data);
      if (chordRes?.data) setChordAnalysis(chordRes.data);

      if (!analysisRes?.data && !chordRes?.data) {
        setToast({ visible: true, message: 'Phân tích chưa sẵn sàng — thử lại sau vài giây.', type: 'info' });
      }
    } catch (err) {
      console.error('Manual analysis failed:', err);
      setToast({ visible: true, message: 'Phân tích thất bại. Kiểm tra server.', type: 'error' });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadLyrics = async () => {
    if (!currentSong) return;

    setLoadingLyrics(true);
    try {
      const [lyricsRes, syncedRes] = await Promise.all([
        getLyrics(currentSong.id).catch(() => ({ data: "" })),
        getSyncedLyrics(currentSong.id).catch(() => ({ data: [] }))
      ]);

      setLyrics(typeof lyricsRes?.data === "string" ? lyricsRes.data : "");
      setSyncedLyrics(Array.isArray(syncedRes?.data) ? syncedRes.data : []);
    } catch (err) {
      console.error("Failed to load lyrics:", err);
      setLyrics("");
      setSyncedLyrics([]);
    } finally {
      setLoadingLyrics(false);
    }
  };

  const hydrateSongDetails = async () => {
    if (!currentSong?.id) {
      setSongDetails(null);
      return;
    }

    try {
      const res = await getSongById(currentSong.id);
      // Backend may return ApiResponse wrapper or direct song
      const next = res?.data ?? res;
      if (next && typeof next === "object") {
        // If artist field is an id (not a display name), try to resolve user's public name
        let nextSong = { ...next };
        const artistId = nextSong.artist || nextSong.uploadedBy;
        const looksLikeId = (val) => typeof val === 'string' && /[0-9a-fA-F]{6,}/.test(val);
        if (artistId && looksLikeId(artistId) && !nextSong.artistName) {
          try {
            const userRes = await getUserById(artistId).catch(() => null);
            const userObj = userRes?.data ?? userRes;
            if (userObj) {
              nextSong.artistName = userObj.username || userObj.name || userObj.fullName || userObj.displayName || artistId;
            }
          } catch (e) {
            // ignore
          }
        }

        // If genres array exists, ensure first genre is set on root for easier display
        if (Array.isArray(nextSong.genres) && nextSong.genres.length > 0) {
          nextSong.genre = nextSong.genre || nextSong.genreName || nextSong.genres[0];
        }

        setSongDetails(nextSong);
      } else {
        setSongDetails(null);
      }
    } catch {
      // best-effort: keep playing even if details endpoint fails
      setSongDetails(null);
    }
  };

  const handleShare = () => {
    if (!user) {
      setToast({ visible: true, message: "Vui lòng đăng nhập để chia sẻ!", type: "info" });
      return;
    }
    setShareCaption("");
    setIsShareModalOpen(true);
  };

  const handleConfirmShare = async () => {
    if (!user || !currentSong || sharing) return;

    setSharing(true);
    try {
      const { createPost } = await import("../api/postService");

      // 1. Create a post with the song attached
      await createPost({
        content: shareCaption || "Nghe bài hát này cùng mình nhé! 🎵",
        songId: currentSong.id,
        type: "SHARE"
      });

      // 2. Record share in social service (internal stats)
      await shareSong({
        userId: user.id,
        songId: currentSong.id,
        platform: "repparton"
      });

      // 3. Update UI
      getShareCountBySong(currentSong.id)
        .then(data => setShareCount(Array.isArray(data) ? data.length : data.count || 0));

      setToast({ visible: true, message: "Đã chia sẻ lên bảng tin thành công!", type: "success" });
      setIsShareModalOpen(false);
    } catch (err) {
      console.error("Failed to share song:", err);
      setToast({ visible: true, message: "Chia sẻ thất bại. Vui lòng thử lại sau.", type: "error" });
    } finally {
      setSharing(false);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const formatDuration = (seconds) => {
    return formatDur(seconds);
  };

  const song = songDetails || currentSong;

  const getArtistDisplay = (s) => {
    if (!s || typeof s !== "object") return "—";
    // Prefer explicit artist display fields, then nested artist object, then uploadedBy,
    // and finally fallback to a raw artist value (only if it's not an id-like string).
    const isIdLike = (val) => typeof val === 'string' && /^[0-9a-fA-F]{6,}$/.test(val);

    if (s.artistName) return s.artistName;
    if (s.artistUsername) return s.artistUsername;

    if (s.artist) {
      if (typeof s.artist === 'object') {
        return s.artist.username || s.artist.name || s.artist.displayName || s.artist.fullName || s.artist.id || '—';
      }
      // if artist is a simple string but looks like a real name (not an id), show it
      if (!isIdLike(s.artist)) return s.artist;
    }

    if (s.artist?.username) return s.artist.username;
    if (s.artist?.name) return s.artist.name;

    if (s.uploadedBy && !isIdLike(s.uploadedBy)) return s.uploadedBy;

    // Last resort: artistName already attempted, if uploadedBy/artist are id-like, show placeholder
    return '—';
  };

  const getGenreDisplay = (s) => {
    if (!s || typeof s !== "object") return "—";
    if (Array.isArray(s.genres) && s.genres.length > 0) return s.genres[0] || "—";
    return (
      s.genre?.name ||
      s.genreName ||
      s.genre ||
      "—"
    );
  };

  const canManageLyrics = () => {
    if (!user || !song) return false;
    const artistId = song.artist?.id;
    if (artistId && String(artistId) === String(user.id)) return true;
    if (song.uploadedBy && String(song.uploadedBy) === String(user.id)) return true;
    return false;
  };

  if (!currentSong) {
    return (
      <MainLayout>
        <div className="no-song-container">
          <div className="no-song-content">
            <i className="bi bi-music-note-beamed no-song-icon"></i>
            <h3>{t("listen.noSong")}</h3>
            <p>{t("listen.chooseSong")}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const coverUrl =
    song.coverUrl ??
    song.coverArtUrl ??
    song.coverImageUrl ??
    song.coverImage ??
    song.imageUrl ??
    song.thumbnailUrl ??
    song.cover;

  return (
    <MainLayout>
      {/* Toast */}
      {toast.visible && (
        <div className={`toast position-fixed top-0 end-0 m-3 p-3 bg-light ${toast.type === 'error' ? 'border-danger' : 'border-info'}`} role="alert">
          <div className="d-flex align-items-center">
            <div className="me-2">{toast.type === 'error' ? '❌' : 'ℹ️'}</div>
            <div>{toast.message}</div>
            <button className="btn-close ms-3" onClick={() => setToast({ ...toast, visible: false })}></button>
          </div>
        </div>
      )}
      <div className="listen-page">
        {/* Animated Background */}
        <div className="listen-bg-gradient"></div>
        <div className="listen-bg-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }}></div>
          ))}
        </div>

        <div className="row justify-content-center position-relative">
          {/* Left Column: Song Info */}
          <div className="col-md-7 d-flex flex-column align-items-center">
            {/* Tabs */}
            <ul className="nav nav-tabs listen-tabs mb-3">
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "cover" ? "active" : ""}`}
                  onClick={() => setActiveTab("cover")}
                >
                  <i className="bi bi-image me-2"></i>
                  {t("listen.tabCover")}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "info" ? "active" : ""}`}
                  onClick={() => setActiveTab("info")}
                >
                  <i className="bi bi-info-circle me-2"></i>
                  {t("listen.tabInfo")}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "lyrics" ? "active" : ""}`}
                  onClick={() => setActiveTab("lyrics")}
                >
                  <i className="bi bi-music-note-list me-2"></i>
                  {t("listen.tabLyrics")}
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link ${activeTab === "analysis" ? "active" : ""}`}
                  onClick={() => setActiveTab("analysis")}
                >
                  <i className="bi bi-graph-up me-2"></i>
                  {t("listen.tabAnalysis")}
                </button>
              </li>
            </ul>

            {/* Action Buttons */}
            <div className="d-flex gap-2 mb-3">
              {canManageLyrics() && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => navigate(`/songs/${song.id}/lyrics`)}
                >
                  <i className="bi bi-music-note-list me-2"></i>
                  {t("listen.manageLyrics")}
                </button>
              )}
            </div>

            {/* Tab Content */}
            {activeTab === "cover" && (
              <>
                {/* Album Art with Vinyl Effect */}
                <div className="album-container">
                  <div className={`vinyl-disc ${playing ? 'spinning' : ''}`}>
                    <div className="vinyl-center"></div>
                  </div>
                  <div className={`album-cover ${playing ? 'playing' : ''}`}>
                    <img
                      src={coverUrl || '/default-cover.png'}
                      alt="cover"
                      onError={(e) => e.target.src = '/default-cover.png'}
                    />
                    <div className="album-overlay">
                      <div className="sound-waves">
                        <span></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Song Title with Animation */}
                <h1 className="song-title">{song.title}</h1>
                <div className="artist-name">{getArtistDisplay(song)}</div>

                {/* Stats with Icons */}
                <div className="song-stats">
                  <div className="stat-item">
                    <i className="bi bi-headphones"></i>
                    <span>{(song.playsCount || song.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <div className="stat-item">
                    <i className="bi bi-clock-history"></i>
                    <span>{song.createdAt ? new Date(song.createdAt).toLocaleDateString() : "Today"}</span>
                  </div>
                  <div className="stat-divider"></div>
                  <button className="stat-item btn-share-toggle" onClick={handleShare}>
                    <i className="bi bi-share"></i>
                    <span>{shareCount}</span>
                  </button>
                </div>
              </>
            )}

            {activeTab === "info" && (
              <div className="song-panel">
                <h5>{t("listen.about")}</h5>
                <div className="song-meta-grid">
                  <div className="song-meta-item">
                    <span className="song-meta-label">{t("listen.metaArtist")}</span>
                    <span className="song-meta-value">{getArtistDisplay(song)}</span>
                  </div>
                  <div className="song-meta-item">
                    <span className="song-meta-label">{t("listen.metaDuration")}</span>
                    <span className="song-meta-value">{formatDuration(song.duration) || "—"}</span>
                  </div>
                  <div className="song-meta-item">
                    <span className="song-meta-label">{t("listen.metaPlays")}</span>
                    <span className="song-meta-value">{(song.playsCount || song.views || 0).toLocaleString()}</span>
                  </div>
                  <div className="song-meta-item">
                    <span className="song-meta-label">{t("listen.metaReleased")}</span>
                    <span className="song-meta-value">{song.createdAt ? new Date(song.createdAt).toLocaleDateString() : "—"}</span>
                  </div>
                  <div className="song-meta-item">
                    <span className="song-meta-label">{t("listen.metaGenre")}</span>
                    <span className="song-meta-value">{getGenreDisplay(song)}</span>
                  </div>
                </div>

                {song.description ? (
                  <p className="song-panel-description">{song.description}</p>
                ) : (
                  <p className="song-panel-empty">{t("listen.noDescription")}</p>
                )}
              </div>
            )}

            {activeTab === "lyrics" && (
              <div className="song-panel">
                <h5>{t("listen.lyricsTitle")}</h5>
                {loadingLyrics ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status"></div>
                    <p className="mt-2 text-muted">{t("listen.loadingLyrics")}</p>
                  </div>
                ) : lyrics || (syncedLyrics && syncedLyrics.length) ? (
                  <>
                    {syncedLyrics && syncedLyrics.length > 0 && (
                      <div className="synced-lyrics-hint">
                        <i className="bi bi-clock me-2"></i>
                        {t("listen.syncedLyricsAvailable")} ({syncedLyrics.length})
                      </div>
                    )}

                    {lyrics ? (
                      <pre className="lyrics-text">{lyrics}</pre>
                    ) : (
                      <p className="song-panel-empty">{t("listen.noLyrics")}</p>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-music-note" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                    <p className="mt-2">{t("listen.noLyrics")}</p>
                    {canManageLyrics() && (
                      <button
                        className="btn btn-outline-primary btn-sm mt-2"
                        onClick={() => navigate(`/songs/${song.id}/lyrics`)}
                      >
                        <i className="bi bi-music-note-list me-2"></i>
                        {t("listen.manageLyrics")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "analysis" && (
              <div>
                {loadingAnalysis ? (
                  <div className="text-center py-4">
                    <div className="spinner-border" role="status"></div>
                    <p className="mt-2 text-muted">Đang tải phân tích AI...</p>
                  </div>
                ) : aiAnalysis || chordAnalysis || currentSong?.analysis ? (
                  <SongAIAnalysis
                    analysis={aiAnalysis || currentSong?.analysis}
                    chordAnalysis={chordAnalysis}
                    song={currentSong}
                    onReanalyze={handleManualAnalyze}
                    loading={loadingAnalysis}
                  />
                ) : (
                  <div className="text-center py-4 text-muted">
                    <i className="bi bi-robot" style={{ fontSize: "3rem", opacity: 0.3 }}></i>
                    <p className="mt-2">Chưa có phân tích AI cho bài hát này</p>
                    <button
                      className="btn btn-primary btn-sm mt-3"
                      onClick={handleManualAnalyze}
                      disabled={loadingAnalysis}
                    >
                      {loadingAnalysis ? 'Đang phân tích...' : 'Phân tích ngay'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Comments */}
          <div className="col-md-4">
            <div className="comments-container">
              <CommentSection songId={currentSong.id} />
            </div>
          </div>

          {/* Share Modal */}
          {isShareModalOpen && (
            <div className="share-modal-overlay" onClick={() => setIsShareModalOpen(false)}>
              <div className="share-modal" onClick={e => e.stopPropagation()}>
                <div className="share-modal-header">
                  <h4>Chia sẻ bài hát</h4>
                  <button className="btn-close-share" onClick={() => setIsShareModalOpen(false)}>
                    <i className="bi bi-x"></i>
                  </button>
                </div>

                <textarea
                  className="share-caption-area"
                  placeholder="Bạn đang nghĩ gì về bài hát này?..."
                  value={shareCaption}
                  onChange={e => setShareCaption(e.target.value)}
                  autoFocus
                ></textarea>

                <div className="share-song-preview">
                  <img src={coverUrl || '/default-cover.png'} alt="cover" />
                  <div className="share-song-info">
                    <h6>{song.title}</h6>
                    <p>{getArtistDisplay(song)}</p>
                  </div>
                </div>

                <div className="share-modal-actions">
                  <button
                    className="btn btn-link text-muted"
                    onClick={() => setIsShareModalOpen(false)}
                    disabled={sharing}
                  >
                    Hủy
                  </button>
                  <button
                    className="btn btn-primary px-4 rounded-pill"
                    onClick={handleConfirmShare}
                    disabled={sharing}
                  >
                    {sharing ? (
                      <span className="spinner-border spinner-border-sm me-2"></span>
                    ) : (
                      <i className="bi bi-send me-2"></i>
                    )}
                    Chia sẻ ngay
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
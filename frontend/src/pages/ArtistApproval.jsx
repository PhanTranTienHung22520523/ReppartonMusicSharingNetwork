import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import {
  getPendingArtists,
  getApprovedArtists,
  getRejectedArtists,
  approveArtist,
  rejectArtist
} from "../api/adminService";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import { FaArrowLeft, FaClock, FaCheckCircle, FaTimesCircle, FaMusic, FaLink, FaFileAlt, FaSearch, FaSyncAlt } from "react-icons/fa";
import "./ArtistApproval.css";

export default function ArtistApproval() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [artists, setArtists] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const [flash, setFlash] = useState(null);

  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    if (!user || !user.roles?.includes("ADMIN")) {
      navigate("/");
      return;
    }
    loadArtists();
  }, [user, activeTab, page, size]);

  const nf = new Intl.NumberFormat("vi-VN");

  const getVerification = (artist) => artist?.artistVerification || {};
  const getArtistName = (artist) => getVerification(artist)?.artistName || artist?.artistName;
  const getGenre = (artist) => getVerification(artist)?.genre || artist?.genre;
  const getDocumentUrl = (artist) =>
    getVerification(artist)?.submittedDocumentUrl || artist?.submittedDocumentUrl || artist?.documentUrl;
  const getVerifiedSongsCount = (artist) =>
    getVerification(artist)?.verifiedSongsCount ?? artist?.verifiedSongsCount;
  const getAiConfidenceScore = (artist) =>
    getVerification(artist)?.aiConfidenceScore ?? artist?.aiConfidenceScore;
  const getRejectionReason = (artist) =>
    getVerification(artist)?.rejectionReason || artist?.rejectionReason;

  const parseSocialLinks = (raw) => {
    if (!raw) return { list: [], entries: [] };
    if (Array.isArray(raw)) return { list: raw.filter(Boolean), entries: [] };

    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (!trimmed) return { list: [], entries: [] };
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return { list: parsed.filter(Boolean), entries: [] };
        }
        if (parsed && typeof parsed === "object") {
          const entries = Object.entries(parsed)
            .filter(([, v]) => v)
            .map(([k, v]) => [String(k), String(v)]);
          return { list: entries.map(([, v]) => v).filter(Boolean), entries };
        }
      } catch {
        // fall through
      }

      // Fallback: comma/newline separated links
      const list = trimmed
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      return { list, entries: [] };
    }

    if (typeof raw === "object") {
      const entries = Object.entries(raw)
        .filter(([, v]) => v)
        .map(([k, v]) => [String(k), String(v)]);
      return { list: entries.map(([, v]) => v).filter(Boolean), entries };
    }

    return { list: [], entries: [] };
  };

  const formatDateTime = (value) => {
    if (!value) return "";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return String(value);
      return d.toLocaleString("vi-VN");
    } catch {
      return String(value);
    }
  };

  const parseListResponse = (res) => {
    const data = res?.data;
    if (Array.isArray(data)) {
      return {
        items: data,
        totalPages: 1,
        totalElements: data.length,
      };
    }
    if (data && Array.isArray(data.content)) {
      return {
        items: data.content,
        totalPages: typeof data.totalPages === "number" ? data.totalPages : 0,
        totalElements: typeof data.totalElements === "number" ? data.totalElements : data.content.length,
      };
    }
    return { items: [], totalPages: 0, totalElements: 0 };
  };

  const getPageButtons = (current, total, maxButtons = 5) => {
    if (!total || total <= 1) return [0];
    const safeTotal = Math.max(1, total);
    const safeCurrent = Math.min(Math.max(0, current), safeTotal - 1);
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(0, safeCurrent - half);
    let end = Math.min(safeTotal - 1, start + maxButtons - 1);
    start = Math.max(0, end - (maxButtons - 1));
    const out = [];
    for (let p = start; p <= end; p++) out.push(p);
    return out;
  };

  const loadArtists = async () => {
    setLoading(true);
    setError("");
    try {
      let res;
      if (activeTab === "pending") {
        res = await getPendingArtists(page, size);
      } else if (activeTab === "approved") {
        res = await getApprovedArtists(page, size);
      } else {
        res = await getRejectedArtists(page, size);
      }
      const parsed = parseListResponse(res);
      setArtists(parsed.items);
      setTotalPages(parsed.totalPages);
      setTotalElements(parsed.totalElements);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      let res;
      if (activeTab === "pending") {
        res = await getPendingArtists(page, size);
      } else if (activeTab === "approved") {
        res = await getApprovedArtists(page, size);
      } else {
        res = await getRejectedArtists(page, size);
      }
      const parsed = parseListResponse(res);
      setArtists(parsed.items);
      setTotalPages(parsed.totalPages);
      setTotalElements(parsed.totalElements);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const showFlash = (type, message, timeoutMs = 2500) => {
    setFlash({ type, message });
    if (timeoutMs > 0) {
      window.clearTimeout(showFlash._t);
      showFlash._t = window.setTimeout(() => setFlash(null), timeoutMs);
    }
  };

  const handleApprove = async (artistId, username) => {
    setProcessing(true);
    setError("");
    try {
      await approveArtist(artistId);
      await loadArtists();
      showFlash("success", `Approved artist${username ? `: ${username}` : ""}`);
    } catch (err) {
      const msg = err?.message || "Approve artist failed";
      setError(msg);
      showFlash("danger", msg);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      return;
    }

    setProcessing(true);
    setError("");
    try {
      await rejectArtist(rejectModal.id, rejectReason);
      showFlash("success", `Rejected artist${rejectModal?.username ? `: ${rejectModal.username}` : ""}`);
      setRejectModal(null);
      setRejectReason("");
      await loadArtists();
    } catch (err) {
      const msg = err?.message || "Reject artist failed";
      setError(msg);
      showFlash("danger", msg);
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 admin-artists">
        <Navbar />
        <div className="text-center py-5" style={{ marginTop: "100px" }}>
          <div className="spinner-border" role="status" />
        </div>
      </div>
    );
  }

  const q = searchTerm.trim().toLowerCase();
  const parseTime = (value) => {
    if (!value) return null;
    const t = new Date(value).getTime();
    return Number.isNaN(t) ? null : t;
  };

  const getSortTime = (artist) => {
    const v = artist?.artistVerification;
    if (activeTab === "pending") {
      return parseTime(v?.submittedAt) ?? parseTime(artist?.submittedAt) ?? parseTime(artist?.createdAt) ?? null;
    }

    // approved/rejected: sort by reviewed time (fallback to submitted)
    return (
      parseTime(v?.reviewedAt) ??
      parseTime(artist?.reviewedAt) ??
      parseTime(v?.submittedAt) ??
      parseTime(artist?.submittedAt) ??
      parseTime(artist?.createdAt) ??
      null
    );
  };

  const visibleArtists = artists
    .filter((a) => {
      if (!q) return true;
      const hay = [a.username, a.email, a.artistName, a?.artistVerification?.artistName]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    })
    // earliest -> latest
    .slice()
    .sort((a, b) => {
      const ta = getSortTime(a);
      const tb = getSortTime(b);
      if (ta === null && tb === null) return 0;
      if (ta === null) return 1;
      if (tb === null) return -1;
      return ta - tb;
    });

  const emptyIcon = activeTab === "approved" ? <FaCheckCircle size={48} className="text-muted mb-3" />
    : activeTab === "rejected" ? <FaTimesCircle size={48} className="text-muted mb-3" />
      : <FaClock size={48} className="text-muted mb-3" />;

  return (
    <div className="min-vh-100 admin-artists">
      <Navbar />

      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        <div className="admin-artists__header p-3 p-md-4 mb-4">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light" onClick={() => navigate("/admin")} title={t('common.back')}>
                <FaArrowLeft />
              </button>
              <div>
                <h2 className="mb-1">{t('admin.artists')}</h2>
                <div className="admin-muted small">
                  {totalPages > 0 ? <>{t('common.page')} {page + 1}/{totalPages}</> : ""}
                  {typeof totalElements === "number" && totalElements > 0 ? <> · {t('common.total')}: {nf.format(totalElements)}</> : ""}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <div className="input-group" style={{ minWidth: 260 }}>
                <span className="input-group-text bg-white"><FaSearch /></span>
                <input
                  className="form-control"
                  placeholder={t('artists.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={() => setSearchTerm("")} disabled={!searchTerm}>
                  {t('common.clear')}
                </button>
              </div>
              <select className="form-select" style={{ width: 120 }} value={size} onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}>
                <option value={6}>6{t('users.filter.perPage')}</option>
                <option value={12}>12{t('users.filter.perPage')}</option>
                <option value={24}>24{t('users.filter.perPage')}</option>
              </select>
              <button className="btn btn-outline-secondary" onClick={refresh} disabled={refreshing}>
                {refreshing ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : (
                  <FaSyncAlt className="me-2" />
                )}
                {t('common.refresh')}
              </button>
            </div>
          </div>
        </div>

        {flash && (
          <div className={`alert alert-${flash.type} d-flex justify-content-between align-items-center`} role="alert">
            <div>{flash.message}</div>
            <button type="button" className="btn-close" aria-label="Close" onClick={() => setFlash(null)} />
          </div>
        )}

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Tabs */}
        <ul className="nav nav-tabs mb-4">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "pending" ? "active" : ""}`}
              onClick={() => { setActiveTab("pending"); setPage(0); setSearchTerm(""); }}
            >
              <FaClock className="me-2" />
              {t('artists.tabs.pending')}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "approved" ? "active" : ""}`}
              onClick={() => { setActiveTab("approved"); setPage(0); setSearchTerm(""); }}
            >
              <FaCheckCircle className="me-2" />
              {t('artists.tabs.approved')}
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "rejected" ? "active" : ""}`}
              onClick={() => { setActiveTab("rejected"); setPage(0); setSearchTerm(""); }}
            >
              <FaTimesCircle className="me-2" />
              {t('artists.tabs.rejected')}
            </button>
          </li>
        </ul>

        {/* Artists List */}
        {visibleArtists.length === 0 ? (
          <div className="text-center py-5">
            {emptyIcon}
            <p className="text-muted">
              {searchTerm ? t('artists.noArtistsMatch') : t('artists.noArtists')}
            </p>
          </div>
        ) : (
          <>
            <div className="row g-3 g-md-4">
              {visibleArtists.map((artist) => (
                <div key={artist.id} className="col-md-6 col-lg-4">
                  <div
                    className="card border-0 shadow-sm h-100 admin-artists__card"
                    role="button"
                    style={{ cursor: "pointer" }}
                    onClick={() => setDetailModal(artist)}
                  >
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        {(artist.profileImageUrl || artist.avatarUrl) ? (
                          <img
                            src={artist.profileImageUrl || artist.avatarUrl}
                            alt={artist.username}
                            className="rounded-circle me-2"
                            style={{ width: 50, height: 50 }}
                          />
                        ) : (
                          <div
                            className="rounded-circle me-2 bg-primary text-white d-flex align-items-center justify-content-center"
                            style={{ width: 50, height: 50 }}
                          >
                            {artist.username?.[0] || "?"}
                          </div>
                        )}
                        <div>
                          <h6 className="mb-0">{artist.username}</h6>
                          <small className="text-muted">{artist.email}</small>
                        </div>
                      </div>

                      {getArtistName(artist) ? (
                        <div className="mb-2">
                          <span className="badge bg-light text-dark border">{t('artists.card.stageName')}</span>
                          <span className="ms-2">{getArtistName(artist)}</span>
                        </div>
                      ) : null}

                      {getVerifiedSongsCount(artist) !== undefined && (
                        <div className="mb-2">
                          <FaMusic className="me-2 text-primary" />
                          <strong>{t('artists.card.songCount')}:</strong> {getVerifiedSongsCount(artist)}
                        </div>
                      )}

                      {getDocumentUrl(artist) && (
                        <div className="mb-2">
                          <FaFileAlt className="me-2 text-secondary" />
                          <a
                            href={getDocumentUrl(artist)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('artists.card.viewDoc')}
                          </a>
                        </div>
                      )}

                      {(() => {
                        const rawLinks = getVerification(artist)?.socialMediaLinks ?? artist?.socialMediaLinks;
                        const parsed = parseSocialLinks(rawLinks);
                        return parsed.list.length > 0 ? (
                          <div className="mb-3">
                            <FaLink className="me-2 text-info" />
                            <strong>{t('artists.card.social')}:</strong>
                            <ul className="list-unstyled mt-2">
                              {parsed.list.slice(0, 2).map((link, idx) => (
                                <li key={idx}>
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-decoration-none small"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {link}
                                  </a>
                                </li>
                              ))}
                              {parsed.list.length > 2 ? (
                                <li className="small text-muted">+{parsed.list.length - 2} link khác</li>
                              ) : null}
                            </ul>
                          </div>
                        ) : null;
                      })()}

                      {getRejectionReason(artist) && (
                        <div className="alert alert-danger small mb-3">
                          <strong>{t('artists.card.rejectionReason')}:</strong> {getRejectionReason(artist)}
                        </div>
                      )}

                      {activeTab === "pending" && (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-success flex-fill"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(artist.id, artist.username);
                            }}
                            disabled={processing}
                          >
                            <FaCheckCircle className="me-2" />
                            {t('artists.card.approve')}
                          </button>
                          <button
                            className="btn btn-danger flex-fill"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectModal(artist);
                            }}
                            disabled={processing}
                          >
                            <FaTimesCircle className="me-2" />
                            {t('artists.card.reject')}
                          </button>
                        </div>
                      )}

                      {activeTab === "approved" && (
                        <div className="text-center">
                          <span className="badge bg-success">
                            <FaCheckCircle className="me-1" />
                            {t('artists.card.approved')}
                          </span>
                        </div>
                      )}

                      {activeTab === "rejected" && (
                        <div className="text-center">
                          <span className="badge bg-danger">
                            <FaTimesCircle className="me-1" />
                            {t('artists.card.rejected')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 ? (
              <div className="d-flex justify-content-between align-items-center mt-4 flex-wrap gap-2">
                <div className="admin-muted small">
                  {typeof totalElements === "number" && totalElements >= 0 ? (
                    <>{t('common.total')}: {nf.format(totalElements)} · </>
                  ) : null}
                  {t('common.page')} {page + 1}/{totalPages}
                </div>

                <nav aria-label="Artist pagination">
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page <= 0 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.max(0, p - 1))}>{t('common.previous')}</button>
                    </li>
                    {getPageButtons(page, totalPages).map((p) => (
                      <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setPage(p)}>{p + 1}</button>
                      </li>
                    ))}
                    <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>{t('common.next')}</button>
                    </li>
                  </ul>
                </nav>
              </div>
            ) : null}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('artists.rejectModal.title')} {rejectModal.username}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setRejectModal(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">{t('artists.rejectModal.reason')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder={t('artists.rejectModal.placeholder')}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setRejectModal(null)}
                  disabled={processing}
                >
                  {t('common.cancel') || "Cancel"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleReject}
                  disabled={processing || !rejectReason.trim()}
                >
                  {processing ? t('artists.rejectModal.processing') : t('artists.rejectModal.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailModal && (() => {
        const v = getVerification(detailModal);
        const artistName = getArtistName(detailModal);
        const genre = getGenre(detailModal);
        const documentUrl = getDocumentUrl(detailModal);
        const verifiedSongsCount = getVerifiedSongsCount(detailModal);
        const aiScore = getAiConfidenceScore(detailModal);
        const rejectionReason = getRejectionReason(detailModal);
        const parsedLinks = parseSocialLinks(v?.socialMediaLinks ?? detailModal?.socialMediaLinks);
        const status = v?.status || detailModal?.status;

        return (
          <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {t('artists.detailModal.title')}{artistName ? `: ${artistName}` : ""}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setDetailModal(null)}
                  />
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="border rounded p-3 h-100">
                        <div className="fw-bold mb-2">{t('artists.detailModal.accountInfo')}</div>
                        <div><strong>User ID:</strong> {detailModal.id}</div>
                        <div><strong>Username:</strong> {detailModal.username}</div>
                        <div><strong>Email:</strong> {detailModal.email}</div>
                        {detailModal.fullName ? <div><strong>{t('profile.fullName') || "Full Name"}:</strong> {detailModal.fullName}</div> : null}
                        {status ? <div className="mt-2"><strong>{t('users.table.status')}:</strong> <span className="badge bg-light text-dark border">{status}</span></div> : null}
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="border rounded p-3 h-100">
                        <div className="fw-bold mb-2">{t('artists.detailModal.appInfo')}</div>
                        {artistName ? <div><strong>{t('artists.card.stageName')}:</strong> {artistName}</div> : null}
                        {genre ? <div><strong>{t('music.genre') || "Genre"}:</strong> {genre}</div> : null}
                        {verifiedSongsCount !== undefined && verifiedSongsCount !== null ? (
                          <div><strong>{t('artists.card.songCount')}:</strong> {verifiedSongsCount}</div>
                        ) : null}
                        {aiScore !== undefined && aiScore !== null ? (
                          <div><strong>{t('artists.detailModal.aiScore')}:</strong> {aiScore <= 1 ? `${Math.round(aiScore * 100)}%` : String(aiScore)}</div>
                        ) : null}
                        {v?.submittedAt ? <div className="mt-2"><strong>{t('artists.detailModal.submittedAt')}:</strong> {formatDateTime(v.submittedAt)}</div> : null}
                        {v?.reviewedAt ? <div><strong>{t('artists.detailModal.reviewedAt')}:</strong> {formatDateTime(v.reviewedAt)}</div> : null}
                        {v?.reviewedBy ? <div><strong>{t('artists.detailModal.reviewedBy')}:</strong> {v.reviewedBy}</div> : null}
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="border rounded p-3">
                        <div className="fw-bold mb-2">{t('artists.detailModal.docsAndLinks')}</div>
                        {documentUrl ? (
                          <div className="mb-2">
                            <FaFileAlt className="me-2 text-secondary" />
                            <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                              {t('artists.detailModal.openDoc')}
                            </a>
                          </div>
                        ) : (
                          <div className="text-muted small mb-2">{t('artists.detailModal.noDoc')}</div>
                        )}

                        {parsedLinks.entries.length > 0 ? (
                          <div className="mb-2">
                            <div className="small text-muted">{t('artists.card.social')}</div>
                            <ul className="mb-0">
                              {parsedLinks.entries.map(([k, url]) => (
                                <li key={`${k}:${url}`}>
                                  <strong>{k}:</strong>{" "}
                                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : parsedLinks.list.length > 0 ? (
                          <div className="mb-2">
                            <div className="small text-muted">{t('artists.card.social')}</div>
                            <ul className="mb-0">
                              {parsedLinks.list.map((url) => (
                                <li key={url}>
                                  <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="text-muted small">{t('artists.detailModal.noLinks')}</div>
                        )}
                      </div>
                    </div>

                    {rejectionReason ? (
                      <div className="col-12">
                        <div className="alert alert-danger mb-0">
                          <strong>{t('artists.card.rejectionReason')}:</strong> {rejectionReason}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-secondary" onClick={() => setDetailModal(null)}>
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      <MusicPlayer />
    </div>
  );
}

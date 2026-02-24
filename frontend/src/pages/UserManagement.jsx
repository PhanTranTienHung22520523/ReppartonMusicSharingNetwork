import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { getAllUsers, searchUsers, banUser, unbanUser, deleteUser } from "../api/adminService";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import { FaArrowLeft, FaSearch, FaBan, FaCheckCircle, FaTrash, FaUser, FaSyncAlt } from "react-icons/fa";
import "./UserManagement.css";

export default function UserManagement() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  const [keywordApplied, setKeywordApplied] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [statusFilter, setStatusFilter] = useState("all"); // all | banned | active | verified | unverified
  const [roleFilter, setRoleFilter] = useState("all"); // all | ADMIN | USER | ARTIST

  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState("");
  const [banning, setBanning] = useState(false);

  useEffect(() => {
    if (!user || !user.roles?.includes("ADMIN")) {
      navigate("/");
      return;
    }
    loadUsers();
  }, [user, page, size, keywordApplied]);

  const nf = new Intl.NumberFormat("vi-VN");

  const normalizeRoles = (u) => {
    const raw = [];
    if (Array.isArray(u?.roles)) raw.push(...u.roles);
    if (typeof u?.role === "string" && u.role.trim()) raw.push(u.role);
    return Array.from(
      new Set(
        raw
          .filter(Boolean)
          .map((r) => String(r).trim().toUpperCase())
          .map((r) => (r.startsWith("ROLE_") ? r.slice("ROLE_".length) : r))
      )
    );
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

  const loadUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = keywordApplied
        ? await searchUsers(keywordApplied, page, size)
        : await getAllUsers(page, size);
      const parsed = parseListResponse(res);
      setUsers(parsed.items);
      setTotalPages(parsed.totalPages);
      setTotalElements(parsed.totalElements);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setSearching(true);
    setError("");
    const kw = searchTerm.trim();
    setPage(0);
    setKeywordApplied(kw);
    setSearching(false);
  };

  const refresh = async () => {
    setRefreshing(true);
    setError("");
    try {
      const res = keywordApplied
        ? await searchUsers(keywordApplied, page, size)
        : await getAllUsers(page, size);
      const parsed = parseListResponse(res);
      setUsers(parsed.items);
      setTotalPages(parsed.totalPages);
      setTotalElements(parsed.totalElements);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBan = async () => {
    if (!banReason.trim()) {
      alert("Vui lòng nhập lý do cấm");
      return;
    }

    setBanning(true);
    try {
      await banUser(banModal.id, banReason);
      setBanModal(null);
      setBanReason("");
      await loadUsers();
    } catch (err) {
      alert(err.message);
    } finally {
      setBanning(false);
    }
  };

  const handleUnban = async (userId) => {
    if (!confirm("Bạn có chắc muốn bỏ cấm user này?")) return;

    try {
      await unbanUser(userId);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm("Bạn có chắc muốn xóa user này? Hành động này không thể hoàn tác!")) return;

    try {
      await deleteUser(userId);
      await loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 admin-users">
        <Navbar />
        <div className="text-center py-5" style={{ marginTop: "100px" }}>
          <div className="spinner-border" role="status" />
        </div>
      </div>
    );
  }

  const visibleUsers = users.filter((u) => {
    const roles = normalizeRoles(u);
    if (roleFilter !== "all" && !roles.includes(roleFilter)) return false;
    if (statusFilter === "banned") return !!u.isBanned;
    if (statusFilter === "active") return !u.isBanned;
    if (statusFilter === "verified") return !!u.isEmailVerified || !!u.isVerified;
    if (statusFilter === "unverified") return !u.isEmailVerified && !u.isVerified;
    return true;
  });

  return (
    <div className="min-vh-100 admin-users">
      <Navbar />

      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        <div className="admin-users__header p-3 p-md-4 mb-4">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-light" onClick={() => navigate("/admin")} title={t('common.back')}>
                <FaArrowLeft />
              </button>
              <div>
                <h2 className="mb-1">{t('users.title')}</h2>
                <div className="admin-muted small">
                  {keywordApplied ? (
                    <>{t('users.searchResult')} <strong>{keywordApplied}</strong></>
                  ) : (
                    <>{t('users.userList')}</>
                  )}
                  {typeof totalElements === "number" && totalElements > 0 ? (
                    <> · {t('common.total')}: {nf.format(totalElements)}</>
                  ) : null}
                  {totalPages > 0 ? <> · {t('common.page')} {page + 1}/{totalPages}</> : null}
                </div>
              </div>
            </div>

            <div className="d-flex gap-2 flex-wrap">
              <button className="btn btn-outline-secondary" onClick={refresh} disabled={refreshing}>
                {refreshing ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                ) : (
                  <FaSyncAlt className="me-2" />
                )}
                {t('common.refresh')}
              </button>
              <div className="d-flex gap-2">
                <select className="form-select" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option value="all">{t('users.filter.allStatus')}</option>
                  <option value="active">{t('users.table.statusActive') || "Active"}</option>
                  <option value="banned">{t('users.table.statusBanned') || "Banned"}</option>
                  <option value="verified">{t('users.filter.verified')}</option>
                  <option value="unverified">{t('users.filter.unverified')}</option>
                </select>
                <select className="form-select" style={{ width: 140 }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                  <option value="all">{t('users.filter.allRoles')}</option>
                  <option value="USER">USER</option>
                  <option value="ARTIST">ARTIST</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
                <select className="form-select" style={{ width: 120 }} value={size} onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}>
                  <option value={10}>10{t('users.filter.perPage')}</option>
                  <option value={20}>20{t('users.filter.perPage')}</option>
                  <option value={50}>50{t('users.filter.perPage')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {/* Search */}
        <div className="card border-0 shadow-sm mb-4 admin-users__card">
          <div className="card-body">
            <form onSubmit={handleSearch} className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder={t('users.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={searching}
              >
                <FaSearch className="me-2" />
                {searching ? t('common.searching') || "Searching..." : t('common.search') || "Search"}
              </button>
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() => {
                  setSearchTerm("");
                  setKeywordApplied("");
                  setPage(0);
                }}
                disabled={!keywordApplied && !searchTerm}
              >
                {t('common.clear')}
              </button>
            </form>
            <div className="admin-muted small mt-2">
              {/* Note: This specific string might not be in translations, adding a generic note or keeping it simple */}
              Filters apply to the current list.
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card border-0 shadow-sm admin-users__card">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="admin-muted small">
                {t('common.showing') || "Showing"}: {nf.format(visibleUsers.length)} user
              </div>
              {totalPages > 1 ? (
                <div className="admin-muted small">{t('common.page')} {page + 1}/{totalPages}</div>
              ) : null}
            </div>
            <div className="table-responsive">
              <table className="table table-hover align-middle admin-users__table">
                <thead>
                  <tr>
                    <th>{t('users.table.user')}</th>
                    <th>{t('users.table.email')}</th>
                    <th>{t('users.table.status')}</th>
                    <th>{t('users.table.role')}</th>
                    <th>{t('users.table.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4">
                        {t('users.noUsers')}
                      </td>
                    </tr>
                  ) : (
                    visibleUsers.map((u) => {
                      const roles = normalizeRoles(u);
                      const isAdmin = roles.includes("ADMIN");
                      const isArtist = roles.includes("ARTIST") || !!u.isVerifiedArtist;
                      const isVerified = !!u.isEmailVerified || !!u.isVerified;
                      return (
                        <tr key={u.id}>
                          <td>
                            <div className="d-flex align-items-center">
                              {u.profileImageUrl ? (
                                <img
                                  src={u.profileImageUrl}
                                  alt={u.username}
                                  className="rounded-circle me-2"
                                  style={{ width: 40, height: 40 }}
                                />
                              ) : (
                                <div
                                  className="rounded-circle me-2 bg-secondary text-white d-flex align-items-center justify-content-center"
                                  style={{ width: 40, height: 40 }}
                                >
                                  <FaUser />
                                </div>
                              )}
                              <div>
                                <div>{u.username}</div>
                                {isArtist && (
                                  <span className="badge bg-primary">Artist</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>{u.email}</td>
                          <td>
                            {u.isBanned ? (
                              <span className="badge bg-danger">{t('users.table.statusBanned')}</span>
                            ) : isVerified ? (
                              <span className="badge bg-success">{t('users.table.statusVerified')}</span>
                            ) : (
                              <span className="badge bg-warning">{t('users.table.statusUnverified')}</span>
                            )}
                          </td>
                          <td>
                            {roles.length > 0 ? (
                              roles.map((r) => (
                                <span key={r} className={`badge me-1 ${r === "ADMIN" ? "bg-dark" : "bg-info"}`}>
                                  {r}
                                </span>
                              ))
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm">
                              {u.isBanned ? (
                                <button
                                  className="btn btn-outline-success"
                                  onClick={() => handleUnban(u.id)}
                                  title={t('users.action.unban')}
                                  disabled={isAdmin}
                                >
                                  <FaCheckCircle />
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-warning"
                                  onClick={() => setBanModal(u)}
                                  title={t('users.action.ban')}
                                  disabled={isAdmin}
                                >
                                  <FaBan />
                                </button>
                              )}
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(u.id)}
                                title={t('users.action.delete')}
                                disabled={isAdmin}
                              >
                                <FaTrash />
                              </button>
                            </div>
                            {isAdmin ? (
                              <div className="admin-muted small mt-1">ADMIN Account</div>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 ? (
              <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
                <div className="admin-muted small">
                  {typeof totalElements === "number" && totalElements >= 0 ? (
                    <>{t('common.total')}: {nf.format(totalElements)} · </>
                  ) : null}
                  {t('common.page')} {page + 1}/{totalPages}
                </div>

                <nav aria-label="User pagination">
                  <ul className="pagination mb-0">
                    <li className={`page-item ${page <= 0 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.max(0, p - 1))}>
                        {t('common.previous')}
                      </button>
                    </li>

                    {getPageButtons(page, totalPages).map((p) => (
                      <li key={p} className={`page-item ${p === page ? "active" : ""}`}>
                        <button className="page-link" onClick={() => setPage(p)}>
                          {p + 1}
                        </button>
                      </li>
                    ))}

                    <li className={`page-item ${page >= totalPages - 1 ? "disabled" : ""}`}>
                      <button className="page-link" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}>
                        {t('common.next')}
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="modal d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{t('users.banModal.title')} {banModal.username}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setBanModal(null)}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">{t('users.banModal.reason')}</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={banReason}
                    onChange={(e) => setBanReason(e.target.value)}
                    placeholder={t('users.banModal.placeholder')}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setBanModal(null)}
                  disabled={banning}
                >
                  {t('common.cancel') || "Cancel"}
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleBan}
                  disabled={banning || !banReason.trim()}
                >
                  {banning ? t('users.banModal.banning') : t('users.banModal.submit')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <MusicPlayer />
    </div>
  );
}

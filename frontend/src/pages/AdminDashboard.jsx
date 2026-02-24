import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";
import { getSystemStats } from "../api/adminService";
import Navbar from "../components/Navbar";
import MusicPlayer from "../components/MusicPlayer";
import { FaUsers, FaCheckCircle, FaBan, FaClock, FaUserCheck, FaTimesCircle, FaChartLine, FaSyncAlt } from "react-icons/fa";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user || (!user.roles?.includes("ADMIN") && user.role !== "ADMIN")) {
      navigate("/");
      return;
    }
    loadStats();
  }, [user]);

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSystemStats();
      setStats(res.data);
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
      const res = await getSystemStats();
      setStats(res.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  const nf = new Intl.NumberFormat("vi-VN");
  const n = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
  const lastUpdatedText = stats?.timestamp
    ? new Date(stats.timestamp).toLocaleString("vi-VN")
    : "";

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
    <div className="min-vh-100 admin-dashboard">
      <Navbar />

      <div className="container py-4" style={{ marginTop: "70px", marginBottom: "100px" }}>
        {/* Header */}
        <div className="admin-dashboard__header p-4 mb-5">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-md-center justify-content-between">
            <div>
              <h2 className="mb-1">{t('admin.title')}</h2>
              <div className="admin-muted small">
                {lastUpdatedText ? `${t('admin.updatedAt')} ${lastUpdatedText}` : ""}
              </div>
            </div>

            <div className="d-flex gap-3 align-items-center flex-wrap">
              <button
                className="btn btn-white border shadow-sm d-flex align-items-center gap-2 px-3 py-2"
                onClick={refresh}
                disabled={refreshing}
                title={t('admin.refresh')}
              >
                {refreshing ? (
                  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
                ) : (
                  <FaSyncAlt className="text-secondary" />
                )}
                <span className="fw-medium text-secondary">{t('admin.refresh')}</span>
              </button>

              <div className="nav-pills-custom d-flex gap-2">
                <button className="btn" onClick={() => navigate("/admin/users")}>{t('admin.manageUsers')}</button>
                <button className="btn" onClick={() => navigate("/admin/artists")}>{t('admin.approveArtists')}</button>
                <button className="btn" onClick={() => navigate("/admin/analytics")}>{t('admin.analytics')}</button>
                <button className="btn" onClick={() => navigate("/reports")}>{t('admin.reports')}</button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">{error}</div>
        )}

        {stats && (() => {
          const totalUsers = n(stats.totalUsers);
          const verifiedUsers = n(stats.verifiedUsers);
          const verifiedPct = totalUsers > 0 ? Math.round((verifiedUsers / totalUsers) * 100) : 0;

          const cards = [
            {
              title: t('admin.totalUsers'),
              value: nf.format(totalUsers),
              icon: <FaUsers />,
              bgClass: "bg-primary-soft",
              hint: t('admin.totalAccounts'),
            },
            {
              title: t('admin.verified'),
              value: nf.format(verifiedUsers),
              icon: <FaCheckCircle />,
              bgClass: "bg-success-soft",
              hint: totalUsers > 0 ? `${verifiedPct}% ${t('admin.verifiedDesc')}` : "",
            },
            {
              title: t('admin.banned'),
              value: nf.format(n(stats.bannedUsers)),
              icon: <FaBan />,
              bgClass: "bg-danger-soft",
              hint: t('admin.bannedAccounts'),
            },
            {
              title: t('admin.totalArtists'),
              value: nf.format(n(stats.totalArtists)),
              icon: <FaChartLine />,
              bgClass: "bg-info-soft",
              hint: t('admin.roleArtist'),
            },
            {
              title: t('admin.pending'),
              value: nf.format(n(stats.pendingArtists)),
              icon: <FaClock />,
              bgClass: "bg-warning-soft",
              hint: t('admin.pendingArtists'),
            },
            {
              title: t('admin.approved'),
              value: nf.format(n(stats.approvedArtists)),
              icon: <FaUserCheck />,
              bgClass: "bg-success-soft",
              hint: t('admin.approvedArtists'),
            },
            {
              title: t('admin.rejected'),
              value: nf.format(n(stats.rejectedArtists)),
              icon: <FaTimesCircle />,
              bgClass: "bg-danger-soft",
              hint: t('admin.rejectedArtists'),
            },
          ];

          return (
            <div className="row g-4 mb-5">
              {cards.map((c, idx) => (
                <div
                  key={c.title}
                  className="col-12 col-md-6 col-lg-3"
                >
                  <div className="admin-stat-card h-100">
                    <div className="card-body">
                      <div className="d-flex align-items-center mb-3">
                        <div className={`admin-stat-icon ${c.bgClass} me-3`}>
                          {c.icon}
                        </div>
                        <div>
                          <div className="admin-card-title">{c.title}</div>
                        </div>
                      </div>
                      <h3 className="admin-kpi">{c.value}</h3>
                      {c.hint && <div className="admin-muted mt-2">{c.hint}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );
        })()}

        {/* Quick Actions */}
        <h5 className="section-title">{t('admin.quickActions')}</h5>
        <div className="card border-0 shadow-sm admin-stat-card">
          <div className="card-body p-4">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div className="admin-muted small">{t('admin.goToAdmin')}</div>
            </div>

            <div className="row g-4">
              <div className="col-12 col-md-4">
                <div className="quick-action-card">
                  <button className="quick-action-btn w-100 qa-users" onClick={() => navigate("/admin/users")}>
                    <FaUsers className="me-3" size={24} />
                    <span>{t('admin.manageUsers')}</span>
                  </button>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="quick-action-card">
                  <button className="quick-action-btn w-100 qa-artists" onClick={() => navigate("/admin/artists")}>
                    <div className="d-flex align-items-center">
                      <FaClock className="me-3" size={24} />
                      <div className="text-start">
                        <div>{t('admin.approveArtists')}</div>
                        <div style={{ fontSize: '0.9em', opacity: 0.9 }}>{n(stats?.pendingArtists)} {t('admin.waiting')}</div>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="quick-action-card">
                  <button className="quick-action-btn w-100 qa-analytics" onClick={() => navigate("/admin/analytics")}>
                    <FaChartLine className="me-3" size={24} />
                    <span>{t('admin.analytics')}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <MusicPlayer />
    </div>
  );
}

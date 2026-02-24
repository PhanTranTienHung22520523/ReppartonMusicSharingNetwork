import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import { useState, useEffect } from "react";
import { FaHeart, FaComment, FaUserPlus, FaMusic, FaShare } from "react-icons/fa";
import { getUnreadCount, getUserNotifications, markAsRead } from "../api/notificationService";
import { useStompWebSocket } from "../hooks/useStompWebSocket";
import {
  extractActorIdFromNotification,
  getUserAvatarUrl,
  getUserByIdCached,
  getUserDisplayName,
  stripActorPrefix,
} from "../utils/notificationEnrichment";
import { getNotificationDestination } from "../utils/notificationNavigation";

const menuItems = [
  { label: "Home", path: "/", icon: "bi bi-house-door-fill", auth: false },
  { label: "Discover", path: "/discover", icon: "bi bi-compass-fill", auth: false },
  { label: "Search", path: "/search", icon: "bi bi-search", auth: false },
  { label: "Genres", path: "/genres", icon: "bi bi-grid-3x3-gap-fill", auth: false },
  { label: "Playlist", path: "/playlist", icon: "bi bi-music-note-list", auth: true },
  { label: "Groups", path: "/groups", icon: "bi bi-people-fill", auth: true },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const formatCreatedAt = (createdAt) => {
    try {
      if (!createdAt) return "Just now";
      if (typeof createdAt === "string") {
        const d = new Date(createdAt);
        return Number.isNaN(d.getTime()) ? "Just now" : d.toLocaleString();
      }
      if (Array.isArray(createdAt)) {
        const [y, m, day, h = 0, min = 0, s = 0] = createdAt;
        const d = new Date(y, (m || 1) - 1, day || 1, h, min, s);
        return Number.isNaN(d.getTime()) ? "Just now" : d.toLocaleString();
      }
      return "Just now";
    } catch {
      return "Just now";
    }
  };

  const mapBackendNotification = async (n) => {
    const fallbackTitle = n?.title || "System";
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackTitle)}&background=666&color=fff`;

    const actorId = extractActorIdFromNotification(n);
    const actorUser = actorId ? await getUserByIdCached(actorId) : null;
    const actorName = getUserDisplayName(actorUser) || fallbackTitle;
    const actorAvatar = getUserAvatarUrl(actorUser) || fallbackAvatar;

    return {
      id: n?.id || Date.now(),
      type: n?.type || "general",
      actorId,
      user: { name: actorName, avatar: actorAvatar },
      content: stripActorPrefix(n?.message || "", actorId),
      target: n?.referenceId,
      time: formatCreatedAt(n?.createdAt),
      read: Boolean(n?.read ?? n?.isRead),
    };
  };

  // Realtime updates for the bell badge + dropdown list
  useStompWebSocket('/ws/notifications', {
    onMessage: async (notification) => {
      const mapped = await mapBackendNotification(notification);
      setNotifications((prev) => [mapped, ...prev].slice(0, 10));
      // New notifications are typically unread
      setUnreadCount((c) => c + 1);
    },
  });

  useEffect(() => {
    let cancelled = false;

    const authed = Boolean(user) && isAuthenticated();
    if (!authed) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const load = async () => {
      try {
        const page = await getUserNotifications(0, 10);
        const content = Array.isArray(page?.content) ? page.content : [];
        const mapped = await Promise.all(content.map(mapBackendNotification));

        if (!cancelled) {
          setNotifications(mapped);

          // Prefer backend unread count when available; fall back to local computation.
          const count = await getUnreadCount();
          const computed = mapped.filter((n) => !n.read).length;
          setUnreadCount(count > 0 ? count : computed);
        }
      } catch (e) {
        console.error('[Navbar] Failed to load notifications:', e);
        if (!cancelled) {
          setNotifications([]);
          setUnreadCount(0);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [user, isAuthenticated]);

  const getIcon = (type) => {
    switch (type) {
      case "like": return <FaHeart className="text-danger" size={14} />;
      case "comment_like": return <FaHeart className="text-danger" size={14} />;
      case "comment": return <FaComment className="text-primary" size={14} />;
      case "comment_reply": return <FaComment className="text-primary" size={14} />;
      case "follow": return <FaUserPlus className="text-success" size={14} />;
      case "share": return <FaShare className="text-info" size={14} />;
      case "new_music": return <FaMusic className="text-warning" size={14} />;
      default: return null;
    }
  };

  const handleNotificationClick = async (notif) => {
    if (!notif) return;

    if (!notif.read) {
      // Optimistic UI update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await markAsRead(notif.id);
      } catch (e) {
        console.error('Failed to mark as read:', e);
      }
    }

    const dest = getNotificationDestination(notif);
    if (dest?.to) {
      navigate(dest.to, dest.state ? { state: dest.state } : undefined);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);

    try {
      await markAllAsRead();
    } catch (e) {
      console.error('Failed to mark all as read:', e);
    }
  };

  const markSingleAsRead = async (e, notifId) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await markAsRead(notifId);
    } catch (e) {
      console.error('Failed to mark single as read:', e);
    }
  };

  return (
    <nav
      className="navbar-horizontal glass-nav"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: "var(--glass-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid var(--glass-border)",
        boxShadow: "var(--depth-sm)",
        zIndex: 5000,
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: "8px",
      }}
    >
      {/* Logo */}
      <Link
        to="/"
        className="navbar-brand d-flex align-items-center"
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "var(--primary-color)",
          textDecoration: "none",
          marginRight: 16,
          minWidth: 180,
        }}
      >
        <img
          src="/1.png"
          alt="Repparton"
          style={{
            width: 40,
            height: 40,
            objectFit: "contain",
            marginRight: 8,
          }}
        />
        Repparton
      </Link>

      {/* Main Navigation */}
      <div
        className="d-flex align-items-center justify-content-center flex-grow-1"
        style={{ maxWidth: 600 }}
      >
        {menuItems.map((item) => {
          if (item.auth && !isAuthenticated()) return null;
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className="nav-link-horizontal"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px 32px",
                color: active ? "var(--primary-color)" : "var(--text-muted)",
                textDecoration: "none",
                position: "relative",
                transition: "all 0.2s ease",
                borderRadius: "8px",
                fontSize: 24,
              }}
            >
              <i className={item.icon}></i>
              {active && (
                <div
                  style={{
                    position: "absolute",
                    bottom: -1,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: "var(--primary-color)",
                    borderRadius: "3px 3px 0 0",
                  }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Right Section */}
      <div className="d-flex align-items-center gap-2" style={{ minWidth: 280, justifyContent: "flex-end" }}>
        {!isAuthenticated() ? (
          <>
            {/* Language Switcher */}
            <button
              className="btn btn-icon me-2"
              onClick={toggleLanguage}
              title={language === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--card-color)",
                border: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {language === "en" ? "VI" : "EN"}
            </button>

            <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">
              {t("auth.signIn")}
            </Link>
            <Link to="/register" className="btn btn-primary rounded-pill px-4">
              {t("auth.signUp")}
            </Link>
          </>
        ) : (
          <>
            {/* Upload Button */}
            <button
              className="btn btn-icon"
              onClick={() => navigate("/upload")}
              title="Upload"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--card-color)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <i className="bi bi-plus-circle-fill" style={{ fontSize: 20, color: "var(--primary-color)" }}></i>
            </button>

            {/* Notifications Dropdown */}
            <div className="dropdown">
              <button
                className="btn btn-icon"
                data-bs-toggle="dropdown"
                title="Notifications"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "var(--card-color)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "relative",
                }}
              >
                <i className="bi bi-bell-fill" style={{ fontSize: 20, color: "var(--text-color)" }}></i>
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 0,
                      width: 18,
                      height: 18,
                      background: "#ef4444",
                      borderRadius: "50%",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {unreadCount}
                  </span>
                )}
              </button>
              <div
                className="dropdown-menu dropdown-menu-end p-0 shadow-lg"
                style={{
                  minWidth: 400,
                  maxHeight: 600,
                  overflowY: "auto",
                  borderRadius: 16,
                  border: "1px solid var(--border-color)",
                  zIndex: 2000,
                  transform: "translateY(10px)"
                }}
              >
                {/* Header */}
                <div className="px-3 py-3 border-bottom d-flex justify-content-between align-items-center" style={{ background: "var(--surface-color)" }}>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0 fw-bold" style={{ color: "var(--text-color)" }}>
                      {t("nav.notifications")}
                    </h6>
                    {unreadCount > 0 && (
                      <span className="badge bg-danger rounded-pill" style={{ fontSize: '10px' }}>{unreadCount} new</span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      className="btn btn-link btn-sm p-0 text-decoration-none"
                      onClick={handleMarkAllAsRead}
                      style={{ fontSize: '12px', fontWeight: 500, color: 'var(--primary-color)' }}
                    >
                      {language === 'vi' ? 'Đánh dấu tất cả đã đọc' : 'Mark all as read'}
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                <div>
                  {notifications.length === 0 ? (
                    <div className="text-center py-5">
                      <i className="bi bi-bell" style={{ fontSize: 48, color: "var(--text-muted)", opacity: 0.3 }}></i>
                      <p className="text-muted small mt-2">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="dropdown-item position-relative"
                        style={{
                          padding: "16px",
                          cursor: "pointer",
                          background: !notif.read ? "var(--primary-light)" : "transparent",
                          borderLeft: !notif.read ? "4px solid var(--primary-color)" : "4px solid transparent",
                          transition: "all 0.2s ease",
                          borderBottom: "1px solid var(--border-color-faint)"
                        }}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className="d-flex gap-3 align-items-start">
                          {/* Left: Icon or Avatar stack */}
                          <div className="position-relative">
                            <img
                              src={notif.user.avatar}
                              alt={notif.user.name}
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                objectFit: "cover",
                                border: '2px solid var(--card-color)'
                              }}
                            />
                            <div
                              style={{
                                position: 'absolute',
                                bottom: -2,
                                right: -2,
                                width: 20,
                                height: 20,
                                borderRadius: "50%",
                                background: "var(--card-color)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}
                            >
                              {getIcon(notif.type)}
                            </div>
                          </div>

                          {/* Middle: Content */}
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                              <span className="fw-bold" style={{ color: "var(--text-color)" }}>
                                {notif.user.name}
                              </span>
                              <span className="text-muted ms-1">{notif.content}</span>
                              {notif.target && (
                                <div className="mt-1" style={{
                                  fontSize: '13px',
                                  color: "var(--primary-color)",
                                  fontWeight: 500,
                                  opacity: 0.8,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}>
                                  "{notif.target}"
                                </div>
                              )}
                            </div>
                            <div className="mt-1 d-flex align-items-center gap-2">
                              <small className="text-muted" style={{ fontSize: '12px' }}>{notif.time}</small>
                              {!notif.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary-color)' }}></div>}
                            </div>
                          </div>

                          {/* Right: Mark as read button (visible on hover or if unread) */}
                          {!notif.read && (
                            <button
                              className="btn btn-sm btn-icon rounded-circle ms-2"
                              title="Mark as read"
                              onClick={(e) => markSingleAsRead(e, notif.id)}
                              style={{
                                width: 28,
                                height: 28,
                                opacity: 0.6,
                                transition: 'opacity 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.6'}
                            >
                              <i className="bi bi-check2-circle text-primary" style={{ fontSize: '18px' }}></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                  <div className="border-top px-3 py-2 text-center" style={{ background: "var(--surface-color)" }}>
                    <button
                      className="btn btn-link btn-sm text-decoration-none"
                      style={{ color: "var(--primary-color)", fontWeight: 600 }}
                      onClick={() => navigate("/notifications")}
                    >
                      {t("common.viewAll")}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Language Switcher */}
            <button
              className="btn btn-icon"
              onClick={toggleLanguage}
              title={language === "en" ? "Switch to Vietnamese" : "Chuyển sang Tiếng Anh"}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--card-color)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontWeight: 600,
                fontSize: 12,
              }}
            >
              {language === "en" ? "VI" : "EN"}
            </button>

            {/* Settings */}
            <button
              className="btn btn-icon"
              onClick={() => navigate("/settings")}
              title="Settings"
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "var(--card-color)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <i className="bi bi-gear-fill" style={{ fontSize: 20, color: "var(--text-color)" }}></i>
            </button>

            {/* User Menu */}
            <div className="dropdown">
              <div
                data-bs-toggle="dropdown"
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 8px 4px 4px",
                  borderRadius: 20,
                  background: "var(--card-color)",
                  transition: "all 0.2s ease",
                }}
                className="user-menu-trigger"
              >
                <UserAvatar user={user} size={32} />
              </div>
              <ul className="dropdown-menu dropdown-menu-end" style={{ minWidth: 200 }}>
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person me-2"></i>
                    {t("nav.profile")}
                  </Link>
                </li>
                {user?.roles?.includes("ADMIN") && (
                  <>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <Link className="dropdown-item" to="/admin">
                        <i className="bi bi-shield-check me-2"></i>
                        Admin Dashboard
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/admin/users">
                        <i className="bi bi-people me-2"></i>
                        Quản lý Users
                      </Link>
                    </li>
                    <li>
                      <Link className="dropdown-item" to="/admin/artists">
                        <i className="bi bi-star me-2"></i>
                        Duyệt Nghệ sĩ
                      </Link>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                  </>
                )}
                <li>
                  <Link className="dropdown-item" to="/analytics">
                    <i className="bi bi-graph-up me-2"></i>
                    {t("nav.analytics")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/history">
                    <i className="bi bi-clock-history me-2"></i>
                    {t("nav.history")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/messages">
                    <i className="bi bi-chat-dots me-2"></i>
                    {t("nav.messages")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/stories">
                    <i className="bi bi-camera me-2"></i>
                    Stories
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/devices">
                    <i className="bi bi-shield-lock me-2"></i>
                    Devices
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/settings">
                    <i className="bi bi-gear me-2"></i>
                    {t("nav.settings")}
                  </Link>
                </li>
                <li>
                  <Link className="dropdown-item" to="/change-password">
                    <i className="bi bi-shield-lock me-2"></i>
                    {language === "vi" ? "Đổi mật khẩu" : "Change Password"}
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    {t("auth.signOut")}
                  </button>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

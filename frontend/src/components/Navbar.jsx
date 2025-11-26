import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";
import { useState, useEffect } from "react";
import { FaHeart, FaComment, FaUserPlus, FaMusic, FaShare } from "react-icons/fa";

const menuItems = [
  { label: "Home", path: "/", icon: "bi bi-house-door-fill", auth: false },
  { label: "Discover", path: "/discover", icon: "bi bi-compass-fill", auth: false },
  { label: "Search", path: "/search", icon: "bi bi-search", auth: false },
  { label: "Genres", path: "/genres", icon: "bi bi-grid-3x3-gap-fill", auth: false },
  { label: "Playlist", path: "/playlist", icon: "bi bi-music-note-list", auth: true },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Mock notifications data
    const mockNotifications = [
      {
        id: 1,
        type: "like",
        user: { name: "Alice Johnson", avatar: "https://ui-avatars.com/api/?name=Alice+Johnson&background=a259ff&color=fff" },
        content: "liked your song",
        target: "Summer Vibes",
        time: "5 min ago",
        read: false
      },
      {
        id: 2,
        type: "comment",
        user: { name: "Bob Smith", avatar: "https://ui-avatars.com/api/?name=Bob+Smith&background=4da6ff&color=fff" },
        content: "commented on your post",
        target: "Amazing track!",
        time: "1h ago",
        read: false
      },
      {
        id: 3,
        type: "follow",
        user: { name: "Sarah Wilson", avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=66bb6a&color=fff" },
        content: "started following you",
        time: "2h ago",
        read: true
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case "like": return <FaHeart className="text-danger" size={14} />;
      case "comment": return <FaComment className="text-primary" size={14} />;
      case "follow": return <FaUserPlus className="text-success" size={14} />;
      case "share": return <FaShare className="text-info" size={14} />;
      case "new_music": return <FaMusic className="text-warning" size={14} />;
      default: return null;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav
      className="navbar-horizontal"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 60,
        background: "var(--surface-color)",
        borderBottom: "1px solid var(--border-color)",
        zIndex: 1000,
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
                className="dropdown-menu dropdown-menu-end p-0" 
                style={{ 
                  minWidth: 380,
                  maxHeight: 500,
                  overflowY: "auto",
                  borderRadius: 12,
                  boxShadow: "var(--shadow-lg)",
                  border: "1px solid var(--border-color)"
                }}
              >
                {/* Header */}
                <div className="px-3 py-3 border-bottom" style={{ background: "var(--surface-color)" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-bold" style={{ color: "var(--text-color)" }}>
                      {t("nav.notifications")}
                    </h6>
                    {unreadCount > 0 && (
                      <span className="badge bg-danger rounded-pill">{unreadCount} new</span>
                    )}
                  </div>
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
                        className="dropdown-item"
                        style={{
                          padding: "12px 16px",
                          cursor: "pointer",
                          background: !notif.read ? "var(--primary-light)" : "transparent",
                          borderLeft: !notif.read ? "3px solid var(--primary-color)" : "3px solid transparent",
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div className="d-flex gap-2 align-items-start">
                          {/* Icon */}
                          <div 
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "var(--bg-secondary)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            {getIcon(notif.type)}
                          </div>

                          {/* Avatar */}
                          <img 
                            src={notif.user.avatar} 
                            alt={notif.user.name}
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: "50%",
                              objectFit: "cover",
                              flexShrink: 0
                            }}
                          />

                          {/* Content */}
                          <div className="flex-grow-1" style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 14 }}>
                              <strong style={{ color: "var(--text-color)" }}>
                                {notif.user.name}
                              </strong>
                              <span className="text-muted ms-1">{notif.content}</span>
                              {notif.target && (
                                <div className="mt-1" style={{ 
                                  fontSize: 13, 
                                  color: "var(--primary-color)",
                                  fontStyle: "italic",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis"
                                }}>
                                  "{notif.target}"
                                </div>
                              )}
                            </div>
                            <small className="text-muted" style={{ fontSize: 12 }}>{notif.time}</small>
                          </div>

                          {/* Unread dot */}
                          {!notif.read && (
                            <div 
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: "var(--primary-color)",
                                flexShrink: 0,
                                marginTop: 4
                              }}
                            />
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
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <Link className="dropdown-item" to="/settings">
                    <i className="bi bi-gear me-2"></i>
                    {t("nav.settings")}
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

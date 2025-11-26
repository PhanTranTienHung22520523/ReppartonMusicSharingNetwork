import { useState, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import MainLayout from "../components/MainLayout";
import { useWebSocket } from "../hooks/useWebSocket";
import { WS_ENDPOINTS } from "../config/api.config";
import { FaBell, FaHeart, FaComment, FaUserPlus, FaMusic, FaShare, FaCheck, FaCheckDouble, FaPlug } from "react-icons/fa";

export default function Notifications() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // WebSocket connection for real-time notifications
  const { isConnected, connectionStatus, lastMessage } = useWebSocket(
    WS_ENDPOINTS.notifications,
    {
      autoConnect: true,
      onMessage: (message) => {
        console.log('New notification received:', message);
        if (message.type === 'notification') {
          // Add new notification to the top of the list
          setNotifications(prev => [{
            id: message.id || Date.now(),
            type: message.notificationType || 'general',
            user: message.user || { name: 'System', avatar: 'https://ui-avatars.com/api/?name=System&background=666&color=fff' },
            content: message.content || message.message,
            target: message.target,
            time: message.timestamp || 'Just now',
            read: false
          }, ...prev]);
        }
      },
      onOpen: () => console.log('Notifications WebSocket connected'),
      onClose: () => console.log('Notifications WebSocket disconnected'),
      onError: (error) => console.error('Notifications WebSocket error:', error)
    }
  );

  useEffect(() => {
    // Mock notifications data (initial load)
    const mockNotifications = [
      {
        id: 1,
        type: "like",
        user: { name: "Alice Johnson", avatar: "https://ui-avatars.com/api/?name=Alice+Johnson&background=a259ff&color=fff" },
        content: "liked your song",
        target: "Summer Vibes",
        time: "5 minutes ago",
        read: false
      },
      {
        id: 2,
        type: "comment",
        user: { name: "Bob Smith", avatar: "https://ui-avatars.com/api/?name=Bob+Smith&background=4da6ff&color=fff" },
        content: "commented on your post",
        target: "Amazing track! Love the beat 🔥",
        time: "1 hour ago",
        read: false
      },
      {
        id: 3,
        type: "follow",
        user: { name: "Sarah Wilson", avatar: "https://ui-avatars.com/api/?name=Sarah+Wilson&background=66bb6a&color=fff" },
        content: "started following you",
        time: "2 hours ago",
        read: true
      },
      {
        id: 4,
        type: "share",
        user: { name: "Mike Johnson", avatar: "https://ui-avatars.com/api/?name=Mike+Johnson&background=ff9f5a&color=fff" },
        content: "shared your song",
        target: "Midnight Drive",
        time: "3 hours ago",
        read: true
      },
      {
        id: 5,
        type: "new_music",
        user: { name: "Taylor Swift", avatar: "https://ui-avatars.com/api/?name=Taylor+Swift&background=ff6b9d&color=fff" },
        content: "released a new song",
        target: "New Era",
        time: "5 hours ago",
        read: true
      }
    ];

    setTimeout(() => {
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case "like": return <FaHeart className="text-danger" />;
      case "comment": return <FaComment className="text-primary" />;
      case "follow": return <FaUserPlus className="text-success" />;
      case "share": return <FaShare className="text-info" />;
      case "new_music": return <FaMusic className="text-warning" />;
      default: return <FaBell />;
    }
  };

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? {...notif, read: true} : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({...notif, read: true})));
  };

  const filteredNotifications = filter === "all" 
    ? notifications 
    : filter === "unread"
    ? notifications.filter(n => !n.read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <MainLayout>
      <div className="container" style={{ maxWidth: 800, paddingTop: 24 }}>
        {/* WebSocket Status Indicator */}
        {user && (
          <div 
            className="d-flex align-items-center gap-2 mb-3 p-2 rounded"
            style={{ 
              fontSize: '0.85rem',
              background: isConnected ? 'rgba(46, 213, 115, 0.1)' : 'rgba(255, 159, 67, 0.1)',
              color: isConnected ? '#2ed573' : '#ff9f43',
              border: `1px solid ${isConnected ? '#2ed573' : '#ff9f43'}40`
            }}
          >
            <FaPlug />
            <span style={{ fontWeight: 500 }}>
              {isConnected ? 'Real-time notifications active' : `Connection ${connectionStatus}`}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 fade-in">
          <div>
            <h2 className="fw-bold mb-1" style={{ color: "var(--text-color)" }}>
              <FaBell className="me-2" style={{ color: "var(--primary-color)" }} />
              {t("nav.notifications")}
            </h2>
            <p className="text-muted mb-0">
              {unreadCount > 0 ? `${unreadCount} ${t("common.unreadNotifications")}` : t("common.allCaughtUp")}
            </p>
          </div>
          {unreadCount > 0 && (
            <button 
              className="btn btn-outline-primary btn-sm scale-in"
              onClick={markAllAsRead}
            >
              <FaCheckDouble className="me-2" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="card mb-4 slide-up" style={{ borderRadius: 16 }}>
          <div className="card-body p-3">
            <div className="d-flex gap-2 flex-wrap">
              {[
                { value: "all", label: "All", icon: <FaBell /> },
                { value: "unread", label: "Unread", icon: <FaCheck /> },
                { value: "like", label: "Likes", icon: <FaHeart /> },
                { value: "comment", label: "Comments", icon: <FaComment /> },
                { value: "follow", label: "Follows", icon: <FaUserPlus /> },
              ].map((item, index) => (
                <button
                  key={item.value}
                  className={`btn ${filter === item.value ? "btn-primary" : "btn-outline-secondary"} btn-sm`}
                  onClick={() => setFilter(item.value)}
                  style={{
                    borderRadius: 12,
                    animation: `fadeIn 0.3s ease ${index * 0.1}s both`
                  }}
                >
                  {item.icon}
                  <span className="ms-2">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="card text-center py-5 fade-in" style={{ borderRadius: 16 }}>
            <div className="card-body">
              <FaBell size={48} className="text-muted mb-3" style={{ opacity: 0.3 }} />
              <h5 className="text-muted">No notifications</h5>
              <p className="text-muted small mb-0">You're all caught up!</p>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-2">
            {filteredNotifications.map((notif, index) => (
              <div
                key={notif.id}
                className={`card notification-item ${!notif.read ? 'notification-unread' : ''}`}
                onClick={() => markAsRead(notif.id)}
                style={{
                  borderRadius: 16,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  animation: `slideInRight 0.4s ease ${index * 0.05}s both`,
                  background: !notif.read ? "var(--primary-light)" : "var(--card-color)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateX(8px)";
                  e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateX(0)";
                  e.currentTarget.style.boxShadow = "var(--shadow)";
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex gap-3 align-items-start">
                    {/* Icon */}
                    <div 
                      className="notification-icon"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--bg-secondary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
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
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "3px solid var(--card-color)",
                        flexShrink: 0
                      }}
                    />

                    {/* Content */}
                    <div className="flex-grow-1">
                      <div className="mb-1">
                        <strong style={{ color: "var(--text-color)" }}>
                          {notif.user.name}
                        </strong>
                        <span className="text-muted ms-2">{notif.content}</span>
                        {notif.target && (
                          <div className="mt-1" style={{ 
                            fontSize: 14, 
                            color: "var(--primary-color)",
                            fontStyle: "italic"
                          }}>
                            "{notif.target}"
                          </div>
                        )}
                      </div>
                      <small className="text-muted">{notif.time}</small>
                    </div>

                    {/* Unread indicator */}
                    {!notif.read && (
                      <div 
                        className="pulse-animation"
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: "var(--primary-color)",
                          flexShrink: 0
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const menu = [
  { label: "Home", path: "/", icon: "bi bi-house", auth: false },
  { label: "Discover", path: "/discover", icon: "bi bi-compass", auth: false },
  { label: "Search", path: "/search", icon: "bi bi-search", auth: false },
  { label: "Recommendations", path: "/recommendations", icon: "bi bi-stars", auth: false },
  { label: "Messages", path: "/messages", icon: "bi bi-chat", auth: true, role: "ARTIST" },
  { label: "Playlist", path: "/playlist", icon: "bi bi-music-note-list", auth: true },
  { label: "Profile", path: "/profile", icon: "bi bi-person", auth: true },
  { label: "Upload", path: "/upload", icon: "bi bi-cloud-arrow-up", auth: true },
  { label: "Settings", path: "/settings", icon: "bi bi-gear", auth: false },
];

export default function Sidebar() {
  const { user } = useAuth();
  const location = useLocation();

  return (
    <aside
      className="d-flex flex-column"
      style={{
        width: 260,
        minHeight: "100vh",
        position: "fixed",
        top: 0,
        left: 0,
        background: "var(--surface-color)",
        borderRight: "1px solid var(--border-color)",
        padding: "24px 0 0 0",
        zIndex: 200,
      }}
    >
      <div className="d-flex align-items-center fs-3 fw-bold px-4 mb-4" style={{ color: "var(--primary-color)" }}>
        <img
          src="/1.png"
          alt="logo"
          style={{ width: 36, height: 36, objectFit: "contain", marginRight: 10 }}
        />
        Repparton
      </div>
      
      <ul className="nav flex-column gap-1 px-2">
        {menu.map((item) => {
          if (item.auth && !user) return null;
          const active = location.pathname === item.path;
          return (
            <li className="nav-item" key={item.path}>
              <Link
                to={item.path}
                className={`nav-link d-flex align-items-center px-3 py-3 rounded fw-medium ${
                  active ? "bg-primary bg-opacity-10 text-primary" : "text-secondary-custom"
                }`}
                style={{
                  fontSize: 16,
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                <i className={item.icon + " me-3"} style={{ fontSize: 20 }}></i>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
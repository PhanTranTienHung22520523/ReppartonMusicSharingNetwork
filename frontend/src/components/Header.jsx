import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import UserAvatar from "./UserAvatar";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="d-flex align-items-center justify-content-between px-4"
      style={{
        height: 72,
        position: "fixed",
        left: 260,
        right: 0,
        top: 0,
        background: "var(--surface-color)",
        zIndex: 100,
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <input
        className="form-control"
        style={{
          maxWidth: 400,
          borderRadius: "var(--border-radius)",
          background: "var(--card-color)",
          border: "1px solid var(--border-color)",
        }}
        placeholder="Search tracks, artists, or friends..."
      />
      
      <div className="d-flex align-items-center gap-3">
        {!user ? (
          <>
            <Link to="/login" className="btn btn-outline-primary rounded-pill px-4">
              Sign In
            </Link>
            <Link to="/register" className="btn btn-primary rounded-pill px-4">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <button 
              className="btn btn-light rounded-circle p-2 me-2" 
              style={{ fontSize: 20 }}
            >
              <i className="bi bi-bell"></i>
            </button>
            
            <div className="dropdown">
              <div
                data-bs-toggle="dropdown"
                style={{ cursor: "pointer" }}
              >
                <UserAvatar 
                  user={user} 
                  size={36}
                />
              </div>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link className="dropdown-item" to="/profile">
                    <i className="bi bi-person me-2"></i>
                    Profile
                  </Link>
                </li>
                <li>
                  <button className="dropdown-item" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
            
            <button
              className="btn btn-primary rounded-pill ms-3"
              style={{ fontWeight: 600, padding: "8px 24px" }}
              onClick={() => navigate("/upload")}
            >
              Upload
            </button>
          </>
        )}
      </div>
    </header>
  );
}
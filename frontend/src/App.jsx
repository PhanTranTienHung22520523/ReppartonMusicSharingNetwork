import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Discover from "./pages/Discover";
import Profile from "./pages/Profile";
import Playlist from "./pages/Playlist";
import PlaylistDetail from "./components/PlaylistDetail";
import Upload from "./pages/Upload";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Listen from "./pages/Listen";
import Search from "./pages/Search";
import RecentSongs from "./pages/RecentSongs";
import Genres from "./pages/Genres";
import Analytics from "./pages/Analytics";
import History from "./pages/History";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Recommendations from "./pages/Recommendations";
import Devices from "./pages/Devices";
import Stories from "./pages/Stories";
import CreateStory from "./pages/CreateStory";
import PostDetail from "./pages/PostDetail";
import ApplyArtist from "./pages/ApplyArtist";
import ArtistGroups from "./pages/ArtistGroups";
import CreateGroup from "./pages/CreateGroup";
import GroupDetail from "./pages/GroupDetail";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import UserManagement from "./pages/UserManagement";
import ArtistApproval from "./pages/ArtistApproval";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import ChangePassword from "./pages/ChangePassword";
import SongLyrics from "./pages/SongLyrics";
import MusicPlayerBar from "./components/MusicPlayerBar";
import { checkAIHealth } from "./api/aiService";
import { useEffect, useState } from "react";
import "./App.css";
import "./themes.css";
import "./animations.css";
import "./glassmorphism.css";
import "./enhanced-animations.css";

function App() {
  const [aiAvailable, setAiAvailable] = useState(null);

  useEffect(() => {
    checkAIHealth()
      .then(response => {
        if (response?.status === "healthy") {
          setAiAvailable(true);
          console.log("✅ AI Service is online");
        } else {
          setAiAvailable(false);
        }
      })
      .catch(() => {
        setAiAvailable(false);
        console.log("⚠️ AI Service is offline");
      });
  }, []);

  const AppRoutesWithPlayer = () => {
    const location = useLocation();
    const path = location.pathname;
    const hidePlayer =
      path.startsWith("/login") ||
      path.startsWith("/register") ||
      path.startsWith("/verify-email") ||
      path.startsWith("/forgot-password") ||
      path.startsWith("/reset-password") ||
      path.startsWith("/change-password");

    return (
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/search" element={<Search />} />
          <Route path="/profile/:userId?" element={<Profile />} />
          <Route path="/playlist" element={<Playlist />} />
          <Route path="/playlist/:id" element={<PlaylistDetail />} />
          <Route path="/recent-songs" element={<RecentSongs />} />
          <Route path="/upload" element={<ProtectedRoute requireAuth={true}><Upload /></ProtectedRoute>} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/listen/:songId?" element={<Listen />} />
          <Route path="/songs/:songId/lyrics" element={<SongLyrics />} />
          <Route path="/genres" element={<Genres />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/devices" element={<Devices />} />
          <Route path="/stories" element={<Stories />} />
          <Route path="/posts/:postId" element={<PostDetail />} />
          <Route path="/create-story" element={<CreateStory />} />
          <Route path="/apply-artist" element={<ApplyArtist />} />
          <Route path="/groups" element={<ArtistGroups />} />
          <Route path="/groups/create" element={<CreateGroup />} />
          <Route path="/groups/:groupId" element={<GroupDetail />} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requireAdmin={true}><AdminAnalytics /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><UserManagement /></ProtectedRoute>} />
          <Route path="/admin/artists" element={<ProtectedRoute requireAdmin={true}><ArtistApproval /></ProtectedRoute>} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePassword />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        {!hidePlayer && <MusicPlayerBar />}
      </>
    );
  };

  return (
    <LanguageProvider>
      <SettingsProvider>
        <AuthProvider>
          <MusicPlayerProvider>
            {/* AI Status Badge */}
            {aiAvailable !== null && (
              <div
                style={{
                  position: "fixed",
                  top: "20px",
                  right: "20px",
                  zIndex: 9999,
                  padding: "8px 16px",
                  borderRadius: "20px",
                  backgroundColor: aiAvailable ? "#4caf50" : "#ff9800",
                  color: "white",
                  fontSize: "12px",
                  fontWeight: "600",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                }}
              >
                {aiAvailable ? (
                  <>
                    <span style={{ fontSize: "14px" }}>✨</span>
                    AI Powered
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "14px" }}>⚠️</span>
                    AI Offline
                  </>
                )}
              </div>
            )}

            <BrowserRouter>
              <AppRoutesWithPlayer />
            </BrowserRouter>
        </MusicPlayerProvider>
      </AuthProvider>
    </SettingsProvider>
  </LanguageProvider>
  );
}
export default App;
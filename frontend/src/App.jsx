import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { MusicPlayerProvider } from "./contexts/MusicPlayerContext";
import { SettingsProvider } from "./contexts/SettingsContext";
import { LanguageProvider } from "./contexts/LanguageContext";
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
import "./App.css";
import "./themes.css";
import "./animations.css";

function App() {
  return (
    <LanguageProvider>
      <SettingsProvider>
        <AuthProvider>
          <MusicPlayerProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/search" element={<Search />} />
              <Route path="/profile/:userId?" element={<Profile />} />
              <Route path="/playlist" element={<Playlist />} />
              <Route path="/playlist/:id" element={<PlaylistDetail />} />
              <Route path="/recent-songs" element={<RecentSongs />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listen/:songId?" element={<Listen />} />
              <Route path="/genres" element={<Genres />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/history" element={<History />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/recommendations" element={<Recommendations />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </MusicPlayerProvider>
      </AuthProvider>
    </SettingsProvider>
  </LanguageProvider>
  );
}
export default App;
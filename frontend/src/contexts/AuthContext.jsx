import { createContext, useContext, useState, useEffect } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          if (userData.token && userData.email) {
            // Check if token might be expired (simple client-side check)
            const tokenParts = userData.token.split(".");
            if (tokenParts.length === 3) {
              try {
                const payload = JSON.parse(atob(tokenParts[1]));
                const now = Date.now() / 1000; // Convert to seconds
                if (payload.exp && payload.exp < now) {
                  // Token is expired, remove it
                  localStorage.removeItem("user");
                  return;
                }
              } catch {
                // Invalid token format, remove it
                localStorage.removeItem("user");
                return;
              }
            }
            setUser(userData);
          } else {
            localStorage.removeItem("user");
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error);
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      // Real backend authentication
      const userData = await authApi.login(email, password);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("lastAuthCheck", Date.now().toString());
      return userData;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("lastAuthCheck");
      
      // Reset to guest theme and navigate to home
      const guestSettings = {
        theme: "light",
        audio: { quality: "high", autoplay: true, crossfade: false, volume: 75, fadeInDuration: 3 },
        notifications: { likes: true, comments: true, followers: true, newMusic: true, email: false, push: true },
        privacy: { publicProfile: true, showActivity: true, publicPlaylists: true, whoCanMsg: "everyone" },
        interface: { showWaveform: true, showLyrics: true, compactMode: false, animationsEnabled: true }
      };
      localStorage.setItem("appSettings_guest", JSON.stringify(guestSettings));
      document.documentElement.setAttribute('data-theme', 'light');
      
      // Navigate to home
      window.location.href = '/';
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      // Real backend registration (auto login after success)
      const userData = await authApi.register(data);
      
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("lastAuthCheck", Date.now().toString());
      return userData;
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const isAuthenticated = () => {
    return user && user.token;
  };

  const isArtist = () => {
    return user && user.role === "ARTIST";
  };

  const isAdmin = () => {
    return user && user.role === "ADMIN";
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUser,
    loading,
    isAuthenticated,
    isArtist,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
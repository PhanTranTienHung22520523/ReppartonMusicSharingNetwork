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
      const userData = await authApi.login(email, password);
      if (userData && userData.token) {
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("lastAuthCheck", Date.now().toString());
        return userData;
      } else {
        throw new Error("Invalid login response");
      }
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
    }
  };

  const register = async (data) => {
    setLoading(true);
    try {
      const userData = await authApi.register(data);
      setUser(userData);
      return userData;
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
import { createContext, useContext, useState, useEffect } from "react";
import { getUserSettings, updateUserSettings } from "../api/userService";

const SettingsContext = createContext();

const DEFAULT_SETTINGS = {
  language: localStorage.getItem("language") || "en",
  theme: "light",
  audio: {
    quality: "high",
    autoplay: true,
    crossfade: false,
    volume: 75,
    fadeInDuration: 3, // seconds
  },
  notifications: {
    likes: true,
    comments: true,
    followers: true,
    newMusic: true,
    email: false,
    push: true,
  },
  privacy: {
    publicProfile: true,
    showActivity: true,
    publicPlaylists: true,
    whoCanMsg: "everyone",
  },
  interface: {
    showWaveform: true,
    showLyrics: true,
    compactMode: false,
    animationsEnabled: true,
  },
};

const normalizeSettingsShape = (maybeSettings) => {
  if (!maybeSettings || typeof maybeSettings !== "object") return { ...DEFAULT_SETTINGS };
  return {
    ...DEFAULT_SETTINGS,
    ...maybeSettings,
    audio: { ...DEFAULT_SETTINGS.audio, ...(maybeSettings.audio || {}) },
    notifications: { ...DEFAULT_SETTINGS.notifications, ...(maybeSettings.notifications || {}) },
    privacy: { ...DEFAULT_SETTINGS.privacy, ...(maybeSettings.privacy || {}) },
    interface: { ...DEFAULT_SETTINGS.interface, ...(maybeSettings.interface || {}) },
  };
};

export function SettingsProvider({ children }) {
  // Load settings from localStorage based on user
  const loadSettings = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?.id || "guest";
      const settingsKey = `appSettings_${userId}`;
      const saved = localStorage.getItem(settingsKey);
      if (saved) {
        return normalizeSettingsShape(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }

    // Default settings (guest theme is light)
    return { ...DEFAULT_SETTINGS };
  };

  const [settings, setSettings] = useState(loadSettings);
  const [remoteLoaded, setRemoteLoaded] = useState(false);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?.id || "guest";
      const settingsKey = `appSettings_${userId}`;
      localStorage.setItem(settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', settings.theme);
    
    // Apply interface settings to body
    const body = document.body;
    
    // Animations
    if (!settings.interface?.animationsEnabled) {
      body.classList.add('animations-disabled');
    } else {
      body.classList.remove('animations-disabled');
    }
    
    // Compact mode
    if (settings.interface?.compactMode) {
      body.classList.add('compact-mode');
    } else {
      body.classList.remove('compact-mode');
    }
    
  }, [settings]);

  // Hydrate from backend when authenticated
  useEffect(() => {
    let cancelled = false;
    const hydrate = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user?.id || !user?.token) {
          setRemoteLoaded(true);
          return;
        }

        const server = await getUserSettings(user.id);
        // Backend uses interfaceSettings, frontend uses interface
        const hydrated = normalizeSettingsShape({
          ...server,
          interface: server.interface || server.interfaceSettings,
        });

        if (!cancelled) {
          setSettings(hydrated);
          setRemoteLoaded(true);
        }
      } catch (e) {
        if (!cancelled) {
          console.warn("Failed to load settings from server, using local values.", e);
          setRemoteLoaded(true);
        }
      }
    };

    hydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  // Debounced save to backend
  useEffect(() => {
    if (!remoteLoaded) return;

    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user?.id || !user?.token) return;

    const timer = setTimeout(() => {
      updateUserSettings(user.id, {
        language: settings.language,
        theme: settings.theme,
        notifications: settings.notifications,
        privacy: settings.privacy,
        audio: settings.audio,
        interfaceSettings: settings.interface,
      }).catch((e) => {
        console.warn("Failed to save settings to server:", e);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [settings, remoteLoaded]);

  // Update specific setting
  const updateSetting = (category, key, value) => {
    if (key === null) {
      // Handle root-level settings
      setSettings(prev => ({
        ...prev,
        [category]: value
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value
        }
      }));
    }
  };

  // Update entire category
  const updateCategory = (category, newValues) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        ...newValues
      }
    }));
  };

  // Reset settings to default (for guest)
  const resetSettings = () => {
    const guestSettings = { ...DEFAULT_SETTINGS, theme: "light" };
    setSettings(guestSettings);
    localStorage.setItem("appSettings_guest", JSON.stringify(guestSettings));
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      setSettings,
      updateSetting,
      updateCategory,
      resetSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

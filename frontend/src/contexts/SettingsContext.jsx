import { createContext, useContext, useState, useEffect } from "react";

const SettingsContext = createContext();

export function SettingsProvider({ children }) {
  // Load settings from localStorage based on user
  const loadSettings = () => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      const userId = user?.id || "guest";
      const settingsKey = `appSettings_${userId}`;
      const saved = localStorage.getItem(settingsKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
    
    // Default settings (guest theme is light)
    return {
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
      }
    };
  };

  const [settings, setSettings] = useState(loadSettings);

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

  // Update specific setting
  const updateSetting = (category, key, value) => {
    if (category === 'theme' || key === null) {
      // Handle theme setting (not in a category)
      setSettings(prev => ({
        ...prev,
        theme: value
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
    const guestSettings = {
      theme: "light",
      audio: {
        quality: "high",
        autoplay: true,
        crossfade: false,
        volume: 75,
        fadeInDuration: 3,
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
      }
    };
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

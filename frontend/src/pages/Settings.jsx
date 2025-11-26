import MainLayout from "../components/MainLayout";
import { useSettings } from "../contexts/SettingsContext";
import { useLanguage } from "../contexts/LanguageContext";

export default function Settings() {
  const { settings, updateSetting } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  
  const { notifications, privacy, audio, theme, interface: interfaceSettings } = settings;

  // Handlers for updating settings
  const handleNotificationChange = (key, value) => {
    updateSetting('notifications', key, value);
  };

  const handlePrivacyChange = (key, value) => {
    updateSetting('privacy', key, value);
  };

  const handleAudioChange = (key, value) => {
    updateSetting('audio', key, value);
  };

  const handleThemeChange = (value) => {
    updateSetting('theme', null, value);
  };

  const handleInterfaceChange = (key, value) => {
    updateSetting('interface', key, value);
  };

  // Custom switch style
  const switchStyle = (checked) => ({
    width: 44,
    height: 24,
    background: checked ? "#a259ff" : "#e5e7eb",
    borderRadius: 24,
    position: "relative",
    border: "none",
    outline: "none",
    transition: "background 0.2s",
    display: "inline-block",
    verticalAlign: "middle",
    marginLeft: 8,
    marginRight: 8,
  });
  const knobStyle = (checked) => ({
    position: "absolute",
    left: checked ? 22 : 2,
    top: 2,
    width: 20,
    height: 20,
    background: "#fff",
    borderRadius: "50%",
    transition: "left 0.2s",
    boxShadow: "0 1px 4px #0002"
  });

  return (
    <MainLayout>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 32}}>
        <h1 className="fw-bold mb-4" style={{color: "var(--text-color)"}}>{t("settings.title")}</h1>
        
        {/* Language & Appearance */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-4" style={{color: "#a259ff"}}>
            <i className="bi bi-translate me-2"></i>{t("settings.language")} & {t("settings.theme")}
          </h5>
          
          {/* Language Selection */}
          <div className="mb-4">
            <b style={{fontSize: 16}}>{t("settings.language")}</b>
            <div className="text-muted small mb-3">Choose your preferred language / Chọn ngôn ngữ của bạn</div>
            <div style={{display: "flex", gap: 12}}>
              <button
                className={`btn ${language === "en" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setLanguage("en")}
                style={{
                  borderRadius: 12, 
                  padding: "16px 32px", 
                  fontWeight: 600,
                  flex: 1,
                  transition: "all 0.3s ease",
                  border: language === "en" ? "2px solid #a259ff" : "2px solid #e5e7eb"
                }}
              >
                🇺🇸 English
              </button>
              <button
                className={`btn ${language === "vi" ? "btn-primary" : "btn-outline-secondary"}`}
                onClick={() => setLanguage("vi")}
                style={{
                  borderRadius: 12, 
                  padding: "16px 32px", 
                  fontWeight: 600,
                  flex: 1,
                  transition: "all 0.3s ease",
                  border: language === "vi" ? "2px solid #a259ff" : "2px solid #e5e7eb"
                }}
              >
                🇻🇳 Tiếng Việt
              </button>
            </div>
          </div>

          <hr className="my-4" />

          {/* Theme Selection */}
          <div className="mb-3">
            <b style={{fontSize: 16}}>{t("settings.theme")}</b>
            <div className="text-muted small mb-3">Select your color scheme / Chọn giao diện màu</div>
            <select 
              className="form-select form-select-lg"
              value={theme}
              onChange={(e) => handleThemeChange(e.target.value)}
              style={{
                borderRadius: 12,
                padding: "16px 20px",
                fontSize: 16,
                fontWeight: 500,
                border: "2px solid var(--border-color)",
                cursor: "pointer"
              }}
            >
              <option value="light">☀️ Light - Sáng</option>
              <option value="dark">🌙 Dark - Tối</option>
              <option value="purple">💜 Purple Dream - Tím mộng mơ</option>
              <option value="ocean">🌊 Ocean Blue - Xanh đại dương</option>
              <option value="forest">🌲 Forest Green - Xanh rừng</option>
              <option value="sunset">🌅 Sunset - Hoàng hôn</option>
              <option value="rose">🌹 Rose Pink - Hồng phấn</option>
              <option value="midnight">🌃 Midnight - Nửa đêm</option>
              <option value="cyber">⚡ Cyberpunk - Công nghệ</option>
              <option value="auto">🔄 Auto - Tự động</option>
            </select>
          </div>
        </div>
        
        {/* Account */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-person me-2"></i>{t("settings.account")}</h5>
          <div className="mb-3">
            <label className="form-label">{t("settings.displayName")}</label>
            <input className="form-control" defaultValue="Your Name" />
          </div>
          <div className="mb-3">
            <label className="form-label">{t("settings.bio")}</label>
            <textarea className="form-control" defaultValue="Music producer and audio enthusiast 🎵"></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">{t("settings.website")}</label>
            <input className="form-control" defaultValue="https://yourwebsite.com" />
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-bell me-2"></i>{t("settings.notifications")}</h5>
          {[
            {key: "likes", label: t("settings.likes"), desc: t("settings.likesDesc")},
            {key: "comments", label: t("settings.comments"), desc: t("settings.commentsDesc")},
            {key: "followers", label: t("settings.followers"), desc: t("settings.followersDesc")},
            {key: "newMusic", label: t("settings.newMusic"), desc: t("settings.newMusicDesc")},
            {key: "email", label: t("settings.emailNotifications"), desc: t("settings.emailDesc")},
            {key: "push", label: t("settings.pushNotifications"), desc: t("settings.pushDesc")},
          ].map(item => (
            <div className="d-flex align-items-center justify-content-between mb-2" key={item.key}>
              <div>
                <b>{item.label}</b>
                <div className="text-muted small">{item.desc}</div>
              </div>
              <button
                style={switchStyle(notifications[item.key])}
                onClick={() => handleNotificationChange(item.key, !notifications[item.key])}
                type="button"
              >
                <span style={knobStyle(notifications[item.key])}></span>
              </button>
            </div>
          ))}
        </div>

        {/* Privacy & Security */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-shield-lock me-2"></i>{t("settings.privacy")}</h5>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.publicProfile")}</b>
              <div className="text-muted small">{t("settings.publicProfileDesc")}</div>
            </div>
            <button
              style={switchStyle(privacy.publicProfile)}
              onClick={() => handlePrivacyChange('publicProfile', !privacy.publicProfile)}
              type="button"
            >
              <span style={knobStyle(privacy.publicProfile)}></span>
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.showActivity")}</b>
              <div className="text-muted small">{t("settings.showActivityDesc")}</div>
            </div>
            <button
              style={switchStyle(privacy.showActivity)}
              onClick={() => handlePrivacyChange('showActivity', !privacy.showActivity)}
              type="button"
            >
              <span style={knobStyle(privacy.showActivity)}></span>
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.publicPlaylists")}</b>
              <div className="text-muted small">{t("settings.publicPlaylistsDesc")}</div>
            </div>
            <button
              style={switchStyle(privacy.publicPlaylists)}
              onClick={() => handlePrivacyChange('publicPlaylists', !privacy.publicPlaylists)}
              type="button"
            >
              <span style={knobStyle(privacy.publicPlaylists)}></span>
            </button>
          </div>
          <div className="mb-2">
            <b>{t("settings.whoCanMessage")}</b>
            <div>
              <label className="me-3">
                <input type="radio" name="whoCanMsg" checked={privacy.whoCanMsg==="everyone"} onChange={()=>handlePrivacyChange('whoCanMsg', 'everyone')} /> {t("settings.everyone")}
              </label>
              <label className="me-3">
                <input type="radio" name="whoCanMsg" checked={privacy.whoCanMsg==="friends"} onChange={()=>handlePrivacyChange('whoCanMsg', 'friends')} /> {t("settings.friendsOnly")}
              </label>
              <label>
                <input type="radio" name="whoCanMsg" checked={privacy.whoCanMsg==="noone"} onChange={()=>handlePrivacyChange('whoCanMsg', 'noone')} /> {t("settings.noOne")}
              </label>
            </div>
          </div>
        </div>

        {/* Audio & Playback */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-volume-up me-2"></i>{t("settings.audioPlayback")}</h5>
          <div className="mb-2">
            <b>{t("settings.audioQuality")}</b>
            <div>
              <label className="me-3">
                <input type="radio" name="audioQuality" checked={audio.quality==="high"} onChange={()=>handleAudioChange('quality', 'high')} /> {t("settings.high")} (320kbps)
              </label>
              <label className="me-3">
                <input type="radio" name="audioQuality" checked={audio.quality==="medium"} onChange={()=>handleAudioChange('quality', 'medium')} /> {t("settings.medium")} (160kbps)
              </label>
              <label>
                <input type="radio" name="audioQuality" checked={audio.quality==="low"} onChange={()=>handleAudioChange('quality', 'low')} /> {t("settings.low")} (96kbps)
              </label>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.autoplay")}</b>
              <div className="text-muted small">{t("settings.autoplayDesc")}</div>
            </div>
            <button
              style={switchStyle(audio.autoplay)}
              onClick={() => handleAudioChange('autoplay', !audio.autoplay)}
              type="button"
            >
              <span style={knobStyle(audio.autoplay)}></span>
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.crossfade")}</b>
              <div className="text-muted small">{t("settings.crossfadeDesc")}</div>
            </div>
            <button
              style={switchStyle(audio.crossfade)}
              onClick={() => handleAudioChange('crossfade', !audio.crossfade)}
              type="button"
            >
              <span style={knobStyle(audio.crossfade)}></span>
            </button>
          </div>
          <div className="mb-2">
            <b>{t("settings.volume")} ({audio.volume}%)</b>
            <input
              type="range"
              min={0}
              max={100}
              value={audio.volume}
              onChange={e=>handleAudioChange('volume', Number(e.target.value))}
              style={{width: "100%"}}
            />
          </div>
          
          <div className="mb-2">
            <b>{t("settings.crossfadeDuration")} ({audio.fadeInDuration || 3}s)</b>
            <div className="text-muted small">{t("settings.crossfadeDurationDesc")}</div>
            <input
              type="range"
              min={1}
              max={10}
              value={audio.fadeInDuration || 3}
              onChange={e=>handleAudioChange('fadeInDuration', Number(e.target.value))}
              style={{width: "100%"}}
            />
          </div>
        </div>

        {/* Interface */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-palette me-2"></i>{t("settings.interface")}</h5>
          
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.showWaveform")}</b>
              <div className="text-muted small">{t("settings.showWaveformDesc")}</div>
            </div>
            <button
              style={switchStyle(interfaceSettings.showWaveform)}
              onClick={() => handleInterfaceChange('showWaveform', !interfaceSettings.showWaveform)}
              type="button"
            >
              <span style={knobStyle(interfaceSettings.showWaveform)}></span>
            </button>
          </div>
          
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.showLyrics")}</b>
              <div className="text-muted small">{t("settings.showLyricsDesc")}</div>
            </div>
            <button
              style={switchStyle(interfaceSettings.showLyrics)}
              onClick={() => handleInterfaceChange('showLyrics', !interfaceSettings.showLyrics)}
              type="button"
            >
              <span style={knobStyle(interfaceSettings.showLyrics)}></span>
            </button>
          </div>
          
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>Compact Mode</b>
              <div className="text-muted small">Use smaller UI elements</div>
            </div>
            <button
              style={switchStyle(interfaceSettings.compactMode)}
              onClick={() => handleInterfaceChange('compactMode', !interfaceSettings.compactMode)}
              type="button"
            >
              <span style={knobStyle(interfaceSettings.compactMode)}></span>
            </button>
          </div>
          
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>{t("settings.animations")}</b>
              <div className="text-muted small">{t("settings.animationsDesc")}</div>
            </div>
            <button
              style={switchStyle(interfaceSettings.animationsEnabled)}
              onClick={() => handleInterfaceChange('animationsEnabled', !interfaceSettings.animationsEnabled)}
              type="button"
            >
              <span style={knobStyle(interfaceSettings.animationsEnabled)}></span>
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-download me-2"></i>{t("settings.dataStorage")}</h5>
          <div className="d-flex align-items-center justify-content-between mb-3 p-3" style={{background: "#fafbfc", borderRadius: 12}}>
            <div>
              <b>{t("settings.downloadData")}</b>
              <div className="text-muted small">{t("settings.downloadDataDesc")}</div>
            </div>
            <button className="btn" style={{background: "#a259ff", color: "#fff", borderRadius: 8}}>{t("settings.request")}</button>
          </div>
          <div className="d-flex align-items-center justify-content-between p-3" style={{background: "#fff0f0", borderRadius: 12}}>
            <div>
              <b style={{color: "#d32f2f"}}>{t("settings.deleteAccount")}</b>
              <div className="text-danger small">{t("settings.deleteAccountDesc")}</div>
            </div>
            <button className="btn btn-danger" style={{borderRadius: 8}}><i className="bi bi-trash me-1"></i>{t("common.delete")}</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
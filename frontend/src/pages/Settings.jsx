import MainLayout from "../components/MainLayout";
import { useSettings } from "../contexts/SettingsContext";

export default function Settings() {
  const { settings, updateSetting } = useSettings();
  
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

  // Custom radio style for theme
  const themeBox = (value, label, color) => (
    <div
      onClick={() => handleThemeChange(value)}
      style={{
        border: theme === value ? "2px solid #a259ff" : "2px solid #eee",
        borderRadius: 16,
        padding: 24,
        background: theme === value ? "#faf6ff" : "#fff",
        cursor: "pointer",
        minWidth: 160,
        textAlign: "center",
        marginRight: 24,
        marginBottom: 12,
        boxShadow: theme === value ? "0 2px 8px #a259ff22" : "none"
      }}
    >
      <div style={{
        width: "100%",
        height: 32,
        background: color,
        borderRadius: 8,
        marginBottom: 12
      }}></div>
      <div style={{fontWeight: theme === value ? 700 : 400}}>{label}</div>
    </div>
  );

  return (
    <MainLayout>
      <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 32}}>
        {/* Account */}
        <div className="card p-4 mb-4" style={{width: 1250, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-person me-2"></i>Account</h5>
          <div className="mb-3">
            <label className="form-label">Display Name</label>
            <input className="form-control" defaultValue="Your Name" />
          </div>
          <div className="mb-3">
            <label className="form-label">Bio</label>
            <textarea className="form-control" defaultValue="Music producer and audio enthusiast 🎵"></textarea>
          </div>
          <div className="mb-3">
            <label className="form-label">Website</label>
            <input className="form-control" defaultValue="https://yourwebsite.com" />
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-bell me-2"></i>Notifications</h5>
          {[
            {key: "likes", label: "Likes", desc: "Get notified when someone likes your tracks"},
            {key: "comments", label: "Comments", desc: "Get notified about new comments on your posts"},
            {key: "followers", label: "New Followers", desc: "Get notified when someone follows you"},
            {key: "newMusic", label: "New Music from Artists", desc: "Get notified when artists you follow release new tracks"},
            {key: "email", label: "Email Notifications", desc: "Receive notifications via email"},
            {key: "push", label: "Push Notifications", desc: "Receive push notifications on your device"},
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
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-shield-lock me-2"></i>Privacy & Security</h5>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>Public Profile</b>
              <div className="text-muted small">Make your profile visible to everyone</div>
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
              <b>Show Activity</b>
              <div className="text-muted small">Let others see your listening activity</div>
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
              <b>Public Playlists</b>
              <div className="text-muted small">Make your playlists visible to others</div>
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
            <b>Who can message you</b>
            <div>
              <label className="me-3">
                <input type="radio" name="whoCanMsg" checked={privacy.whoCanMsg==="everyone"} onChange={()=>handlePrivacyChange('whoCanMsg', 'everyone')} /> Everyone
              </label>
              <label className="me-3">
                <input type="radio" name="whoCanMsg" checked={privacy.whoCanMsg==="friends"} onChange={()=>handlePrivacyChange('whoCanMsg', 'friends')} /> Friends only
              </label>
              <label>
                <input type="radio" name="whoCanMsg" checked={privacy.whoCanMsg==="noone"} onChange={()=>handlePrivacyChange('whoCanMsg', 'noone')} /> No one
              </label>
            </div>
          </div>
        </div>

        {/* Audio & Playback */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-volume-up me-2"></i>Audio & Playback</h5>
          <div className="mb-2">
            <b>Audio Quality</b>
            <div>
              <label className="me-3">
                <input type="radio" name="audioQuality" checked={audio.quality==="high"} onChange={()=>handleAudioChange('quality', 'high')} /> High (320kbps)
              </label>
              <label className="me-3">
                <input type="radio" name="audioQuality" checked={audio.quality==="medium"} onChange={()=>handleAudioChange('quality', 'medium')} /> Medium (160kbps)
              </label>
              <label>
                <input type="radio" name="audioQuality" checked={audio.quality==="low"} onChange={()=>handleAudioChange('quality', 'low')} /> Low (96kbps)
              </label>
            </div>
          </div>
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>Autoplay</b>
              <div className="text-muted small">Automatically play the next track</div>
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
              <b>Crossfade</b>
              <div className="text-muted small">Smooth transition between tracks</div>
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
            <b>Volume ({audio.volume}%)</b>
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
            <b>Crossfade Duration ({audio.fadeInDuration || 3}s)</b>
            <div className="text-muted small">Duration of fade in/out when crossfade is enabled</div>
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

        {/* Appearance */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-palette me-2"></i>Appearance</h5>
          <div className="mb-3">
            <b>Theme</b>
            <div className="d-flex flex-wrap mt-2">
              {themeBox("light", "Light", "#fff")}
              {themeBox("dark", "Dark", "linear-gradient(90deg,#23232b 60%,#23232b 100%)")}
              {themeBox("auto", "Auto", "linear-gradient(90deg,#fff 0%,#23232b 100%)")}
            </div>
          </div>
          
          <div className="d-flex align-items-center justify-content-between mb-2">
            <div>
              <b>Show Waveform</b>
              <div className="text-muted small">Display audio waveform in player</div>
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
              <b>Show Lyrics</b>
              <div className="text-muted small">Display lyrics when available</div>
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
              <b>Animations</b>
              <div className="text-muted small">Enable UI animations and transitions</div>
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
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-download me-2"></i>Data & Storage</h5>
          <div className="d-flex align-items-center justify-content-between mb-3 p-3" style={{background: "#fafbfc", borderRadius: 12}}>
            <div>
              <b>Download Your Data</b>
              <div className="text-muted small">Get a copy of all your SoundSpace data</div>
            </div>
            <button className="btn" style={{background: "#a259ff", color: "#fff", borderRadius: 8}}>Request</button>
          </div>
          <div className="d-flex align-items-center justify-content-between p-3" style={{background: "#fff0f0", borderRadius: 12}}>
            <div>
              <b style={{color: "#d32f2f"}}>Delete Account</b>
              <div className="text-danger small">Permanently delete your account and all data</div>
            </div>
            <button className="btn btn-danger" style={{borderRadius: 8}}><i className="bi bi-trash me-1"></i>Delete</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
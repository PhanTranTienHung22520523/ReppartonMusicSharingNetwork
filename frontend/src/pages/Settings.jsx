import MainLayout from "../components/MainLayout";
import { useSettings } from "../contexts/SettingsContext";
import { useLanguage } from "../contexts/LanguageContext";
import ArtistMessagingSettings from "../components/ArtistMessagingSettings";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { deleteUserAccount, getUserProfile, getUserSettings, updateUserProfile } from "../api/userService";

export default function Settings() {
  const { settings, updateSetting } = useSettings();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const { user, logout, updateUser: updateAuthUser } = useAuth();
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");

  const isArtist = Boolean(user && (user.roles?.includes("ARTIST") || user.role === "ARTIST"));
  const isArtistPending = Boolean(user?.isArtistPending || user?.artistVerification?.status === "pending");
  
  const { privacy, audio, theme, interface: interfaceSettings } = settings;

  // Load profile from backend
  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        setProfileLoading(true);
        const data = await getUserProfile(user.id);
        const u = data?.user || data?.user?.user || data?.user || data?.userResponse || data?.userData;
        const resolved = data?.user || u;
        const nextDisplayName = resolved?.displayName || resolved?.fullName || resolved?.username || "";
        const nextBio = resolved?.bio || "";
        const nextWebsite = resolved?.website || "";
        if (!cancelled) {
          setDisplayName(nextDisplayName);
          setBio(nextBio);
          setWebsite(nextWebsite);
        }
      } catch (e) {
        console.warn("Failed to load profile", e);
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Keep settings.language in sync with LanguageContext
  useEffect(() => {
    if (!settings?.language || settings.language !== language) {
      updateSetting("language", null, language);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handlers for updating settings
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
        
        {/* Artist Messaging Settings (only for artists) */}
        <ArtistMessagingSettings />
        
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
                onClick={() => {
                  setLanguage("en");
                  updateSetting("language", null, "en");
                }}
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
                onClick={() => {
                  setLanguage("vi");
                  updateSetting("language", null, "vi");
                }}
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
          {profileLoading && (
            <div className="text-muted small mb-3">{t("common.loading")}</div>
          )}
          <div className="mb-3">
            <label className="form-label">{t("settings.displayName")}</label>
            <input
              className="form-control"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your Name"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{t("settings.bio")}</label>
            <textarea
              className="form-control"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Music producer and audio enthusiast"
            />
          </div>
          <div className="mb-3">
            <label className="form-label">{t("settings.website")}</label>
            <input
              className="form-control"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>

          {user && !isArtist && (
            <div
              className={`d-flex align-items-center justify-content-between mb-3 p-3 ${isArtistPending ? "bg-warning-subtle" : "bg-info-subtle"}`}
              style={{ borderRadius: 12, border: "1px solid var(--border-color)" }}
            >
              <div>
                <b>{language === "vi" ? "Đăng ký làm Nghệ sĩ" : "Apply to become an Artist"}</b>
                <div className="text-muted small">
                  {isArtistPending
                    ? (language === "vi" ? "Đơn của bạn đang chờ admin phê duyệt." : "Your application is pending admin approval.")
                    : (language === "vi" ? "Trở thành nghệ sĩ để upload bài hát." : "Become an artist to upload music.")}
                </div>
              </div>
              {!isArtistPending && (
                <button
                  className="btn btn-outline-primary"
                  style={{borderRadius: 10, fontWeight: 600}}
                  onClick={() => navigate("/apply-artist")}
                  type="button"
                >
                  {language === "vi" ? "Đăng ký" : "Apply"}
                </button>
              )}
            </div>
          )}

          <div className="d-flex justify-content-end">
            <button
              className="btn btn-primary"
              disabled={!user?.id || profileSaving}
              onClick={async () => {
                if (!user?.id) return;
                try {
                  setProfileSaving(true);
                  const updated = await updateUserProfile(user.id, {
                    displayName: displayName?.trim() || null,
                    bio: bio ?? null,
                    website: website?.trim() || null,
                  });
                  // Keep AuthContext user in sync (best-effort)
                  const updatedUser = updated?.user || updated?.user?.user || updated?.user;
                  if (updatedUser) {
                    updateAuthUser(updatedUser);
                  }
                } catch (e) {
                  alert(e.message || "Failed to update profile");
                } finally {
                  setProfileSaving(false);
                }
              }}
              style={{ borderRadius: 10, fontWeight: 600 }}
              type="button"
            >
              {profileSaving ? t("common.loading") : t("common.save")}
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="card p-4 mb-4" style={{width: 700, borderRadius: 20}}>
          <h5 className="mb-3" style={{color: "#a259ff"}}><i className="bi bi-shield-lock me-2"></i>{t("settings.privacy")}</h5>

          {/* Change password */}
          <div className="d-flex align-items-center justify-content-between mb-3 p-3" style={{background: "var(--card-color)", borderRadius: 12, border: "1px solid var(--border-color)"}}>
            <div>
              <b>{language === "vi" ? "Đổi mật khẩu" : "Change Password"}</b>
              <div className="text-muted small">{language === "vi" ? "Cập nhật mật khẩu để bảo mật tài khoản" : "Update your password to keep your account secure"}</div>
            </div>
            <button
              className="btn btn-outline-primary"
              style={{borderRadius: 10, fontWeight: 600}}
              onClick={() => navigate("/change-password")}
              type="button"
            >
              {language === "vi" ? "Đổi" : "Change"}
            </button>
          </div>

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
            <button
              className="btn"
              style={{background: "#a259ff", color: "#fff", borderRadius: 8}}
              disabled={!user?.id || downloadLoading}
              onClick={async () => {
                if (!user?.id) {
                  alert("Please login first");
                  return;
                }
                try {
                  setDownloadLoading(true);
                  const [profile, userSettings] = await Promise.all([
                    getUserProfile(user.id),
                    getUserSettings(user.id),
                  ]);
                  const payload = {
                    exportedAt: new Date().toISOString(),
                    profile,
                    settings: userSettings,
                  };
                  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `repparton-data-${user.id}.json`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (e) {
                  alert(e.message || "Failed to download data");
                } finally {
                  setDownloadLoading(false);
                }
              }}
              type="button"
            >
              {downloadLoading ? t("common.loading") : t("settings.request")}
            </button>
          </div>
          <div className="d-flex align-items-center justify-content-between p-3" style={{background: "#fff0f0", borderRadius: 12}}>
            <div>
              <b style={{color: "#d32f2f"}}>{t("settings.deleteAccount")}</b>
              <div className="text-danger small">{t("settings.deleteAccountDesc")}</div>
            </div>
            <button
              className="btn btn-danger"
              style={{borderRadius: 8}}
              disabled={!user?.id || deleteLoading}
              onClick={async () => {
                if (!user?.id) {
                  alert("Please login first");
                  return;
                }
                const ok = window.confirm(
                  language === "vi"
                    ? "Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác."
                    : "Are you sure you want to delete your account? This cannot be undone."
                );
                if (!ok) return;

                try {
                  setDeleteLoading(true);
                  await deleteUserAccount(user.id);
                  await logout();
                } catch (e) {
                  alert(e.message || "Failed to delete account");
                } finally {
                  setDeleteLoading(false);
                }
              }}
              type="button"
            >
              <i className="bi bi-trash me-1"></i>{deleteLoading ? t("common.loading") : t("common.delete")}
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
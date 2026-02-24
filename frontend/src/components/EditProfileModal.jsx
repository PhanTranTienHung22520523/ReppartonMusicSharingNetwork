import { useState } from "react";
import { updateUserProfile, uploadAvatar, uploadCover } from "../api/userService";

export default function EditProfileModal({ profile, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    firstName: profile?.user?.firstName || "",
    lastName: profile?.user?.lastName || "",
    bio: profile?.user?.bio || "",
    avatarUrl: profile?.user?.avatarUrl || "",
    coverUrl: profile?.user?.coverUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = async (type, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File ảnh không được vượt quá 5MB");
      return;
    }

    setError("");
    
    try {
      if (type === 'avatar') {
        setUploadingAvatar(true);
        const result = await uploadAvatar(profile.user.id, file);
        setFormData(prev => ({ ...prev, avatarUrl: result.imageUrl }));
      } else {
        setUploadingCover(true);
        const result = await uploadCover(profile.user.id, file);
        setFormData(prev => ({ ...prev, coverUrl: result.imageUrl }));
      }
    } catch (err) {
      setError(err.message || "Không thể tải ảnh lên");
    } finally {
      if (type === 'avatar') {
        setUploadingAvatar(false);
      } else {
        setUploadingCover(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const updated = await updateUserProfile(profile.user.id, formData);
      onSuccess(updated);
      onClose();
    } catch (err) {
      setError(err.message || "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="modal fade show" 
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div 
        className="modal-dialog modal-dialog-centered modal-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content" style={{ borderRadius: 16 }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold">
              <i className="bi bi-pencil-square me-2 text-primary"></i>
              Chỉnh sửa thông tin cá nhân
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              disabled={loading}
            ></button>
          </div>
          
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="row g-3">
                {/* First Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person me-1"></i>
                    Tên
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Nhập tên của bạn"
                    style={{ borderRadius: 8 }}
                  />
                </div>

                {/* Last Name */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-person me-1"></i>
                    Họ
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Nhập họ của bạn"
                    style={{ borderRadius: 8 }}
                  />
                </div>

                {/* Bio */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    <i className="bi bi-chat-left-text me-1"></i>
                    Tiểu sử
                    <span className="text-muted ms-2" style={{ fontSize: '0.85rem' }}>({formData.bio.length}/60)</span>
                  </label>
                  <textarea
                    className="form-control"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="2"
                    maxLength="30"
                    placeholder="Viết vài dòng về bạn... (tối đa 30 ký tự)"
                    style={{ borderRadius: 8 }}
                  />
                </div>

                {/* Avatar Upload */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold d-block">
                    <i className="bi bi-image me-1"></i>
                    Ảnh đại diện
                  </label>
                  <div className="d-flex flex-column align-items-center gap-2 p-3 border rounded" style={{ borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e0e0e0' }}>
                    <div className="position-relative">
                      {formData.avatarUrl ? (
                        <img 
                          src={formData.avatarUrl} 
                          alt="Avatar" 
                          className="rounded-circle"
                          style={{ width: 100, height: 100, objectFit: "cover", border: '3px solid #6f42c1' }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 100, height: 100 }}>
                          <i className="bi bi-person" style={{ fontSize: '3rem', color: '#ccc' }}></i>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('avatar', e)}
                      style={{ display: 'none' }}
                      disabled={uploadingAvatar || loading}
                    />
                    <label
                      htmlFor="avatar-upload"
                      className={`btn btn-sm btn-primary ${uploadingAvatar || loading ? 'disabled' : ''}`}
                      style={{ borderRadius: 20, padding: '6px 20px', fontSize: '0.875rem', cursor: uploadingAvatar || loading ? 'not-allowed' : 'pointer' }}
                    >
                      {uploadingAvatar ? (
                        <><span className="spinner-border spinner-border-sm me-1"></span>Đang tải...</>
                      ) : (
                        <><i className="bi bi-cloud-upload me-1"></i>Chọn ảnh</>
                      )}
                    </label>
                  </div>
                </div>

                {/* Cover Upload */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold d-block">
                    <i className="bi bi-image-fill me-1"></i>
                    Ảnh bìa
                  </label>
                  <div className="d-flex flex-column align-items-center gap-2 p-3 border rounded" style={{ borderRadius: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e0e0e0' }}>
                    <div className="w-100" style={{ height: 100, overflow: 'hidden' }}>
                      {formData.coverUrl ? (
                        <img 
                          src={formData.coverUrl} 
                          alt="Cover" 
                          className="rounded"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ) : (
                        <div className="w-100 h-100 bg-light rounded d-flex align-items-center justify-content-center">
                          <i className="bi bi-image" style={{ fontSize: '2.5rem', color: '#ccc' }}></i>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      id="cover-upload"
                      accept="image/*"
                      onChange={(e) => handleFileSelect('cover', e)}
                      style={{ display: 'none' }}
                      disabled={uploadingCover || loading}
                    />
                    <label
                      htmlFor="cover-upload"
                      className={`btn btn-sm btn-primary ${uploadingCover || loading ? 'disabled' : ''}`}
                      style={{ borderRadius: 20, padding: '6px 20px', fontSize: '0.875rem', cursor: uploadingCover || loading ? 'not-allowed' : 'pointer' }}
                    >
                      {uploadingCover ? (
                        <><span className="spinner-border spinner-border-sm me-1"></span>Đang tải...</>
                      ) : (
                        <><i className="bi bi-cloud-upload me-1"></i>Chọn ảnh</>
                      )}
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-footer border-0 pt-4">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onClose}
                  disabled={loading}
                  style={{ borderRadius: 8 }}
                >
                  <i className="bi bi-x-lg me-1"></i>
                  Hủy
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ borderRadius: 8 }}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Lưu thay đổi
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

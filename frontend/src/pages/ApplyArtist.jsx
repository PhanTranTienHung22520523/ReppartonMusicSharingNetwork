import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { applyToBeArtist } from "../api/userService";
import { getCurrentUser } from "../api/auth";
import { FaMusic, FaUpload, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

export default function ApplyArtist() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    artistName: "",
    documentUrl: "",
    socialMediaLinks: "",
    verifiedSongsCount: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({
      ...f,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.artistName.trim()) {
      setError("Vui lòng nhập tên nghệ sĩ");
      return;
    }

    setLoading(true);
    try {
      const res = await applyToBeArtist(user.id, {
        artistName: form.artistName,
        documentUrl: form.documentUrl,
        socialMediaLinks: form.socialMediaLinks,
        verifiedSongsCount: parseInt(form.verifiedSongsCount) || 0,
      });

      // Update local user immediately so Upload/Settings can show pending + cancel.
      const returnedUser = res?.data;
      if (returnedUser && typeof returnedUser === "object") {
        updateUser(returnedUser);
      } else {
        const fresh = await getCurrentUser();
        if (fresh) updateUser(fresh);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/profile/" + user.id);
      }, 2000);
    } catch (err) {
      setError(err.message || "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div
              className="card shadow-lg border-0"
              style={{
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
              }}
            >
              <div className="card-body p-5">
                {/* Logo và tiêu đề */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <FaMusic
                      size={48}
                      style={{
                        color: "#667eea",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    />
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                    Đăng ký làm Nghệ sĩ
                  </h2>
                  <p className="text-muted">
                    Trở thành nghệ sĩ để chia sẻ âm nhạc của bạn với cộng đồng
                  </p>
                </div>

                {/* Success message */}
                {success && (
                  <div className="alert alert-success d-flex align-items-center" role="alert">
                    <FaCheckCircle className="me-2" />
                    <div>
                      Đăng ký thành công! Đơn của bạn đang chờ admin phê duyệt.
                    </div>
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="alert alert-danger d-flex align-items-center" role="alert">
                    <FaTimesCircle className="me-2" />
                    <div>{error}</div>
                  </div>
                )}

                {/* Form đăng ký */}
                <form onSubmit={handleSubmit}>
                  {/* Artist Name */}
                  <div className="mb-3">
                    <label htmlFor="artistName" className="form-label fw-bold">
                      Tên nghệ sĩ <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="artistName"
                      name="artistName"
                      value={form.artistName}
                      onChange={handleChange}
                      placeholder="Nhập tên nghệ danh của bạn"
                      disabled={loading || success}
                      required
                      style={{
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    />
                    <small className="text-muted">
                      Tên này sẽ hiển thị trên profile và các bài hát của bạn
                    </small>
                  </div>

                  {/* Social Media Links */}
                  <div className="mb-3">
                    <label htmlFor="socialMediaLinks" className="form-label fw-bold">
                      Link mạng xã hội
                    </label>
                    <textarea
                      className="form-control"
                      id="socialMediaLinks"
                      name="socialMediaLinks"
                      value={form.socialMediaLinks}
                      onChange={handleChange}
                      placeholder="Facebook, Instagram, YouTube, SoundCloud, v.v. (mỗi link một dòng)"
                      rows="3"
                      disabled={loading || success}
                      style={{
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    />
                    <small className="text-muted">
                      Giúp chúng tôi xác minh danh tính của bạn
                    </small>
                  </div>

                  {/* Document URL */}
                  <div className="mb-3">
                    <label htmlFor="documentUrl" className="form-label fw-bold">
                      Link tài liệu xác minh
                    </label>
                    <input
                      type="url"
                      className="form-control"
                      id="documentUrl"
                      name="documentUrl"
                      value={form.documentUrl}
                      onChange={handleChange}
                      placeholder="Link Google Drive, Dropbox chứa CMND/CCCD, giấy tờ nghệ sĩ"
                      disabled={loading || success}
                      style={{
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    />
                    <small className="text-muted">
                      Upload tài liệu lên Google Drive/Dropbox và chia sẻ link công khai
                    </small>
                  </div>

                  {/* Verified Songs Count */}
                  <div className="mb-4">
                    <label htmlFor="verifiedSongsCount" className="form-label fw-bold">
                      Số bài hát đã phát hành (nếu có)
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="verifiedSongsCount"
                      name="verifiedSongsCount"
                      value={form.verifiedSongsCount}
                      onChange={handleChange}
                      min="0"
                      disabled={loading || success}
                      style={{
                        borderRadius: "10px",
                        padding: "12px",
                      }}
                    />
                    <small className="text-muted">
                      Số bài hát bạn đã phát hành trên các nền tảng khác
                    </small>
                  </div>

                  {/* Info box */}
                  <div className="alert alert-info mb-4" role="alert">
                    <FaClock className="me-2" />
                    <strong>Lưu ý:</strong> Đơn đăng ký sẽ được admin xem xét trong vòng 24-48 giờ.
                    Bạn sẽ nhận được thông báo khi đơn được phê duyệt hoặc từ chối.
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100"
                    disabled={loading || success}
                    style={{
                      borderRadius: "10px",
                      padding: "12px",
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                    }}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Đang gửi đơn...
                      </>
                    ) : success ? (
                      <>
                        <FaCheckCircle className="me-2" />
                        Đã gửi đơn thành công!
                      </>
                    ) : (
                      <>
                        <FaUpload className="me-2" />
                        Gửi đơn đăng ký
                      </>
                    )}
                  </button>
                </form>

                {/* Back to profile */}
                <div className="text-center mt-3">
                  <button
                    onClick={() => navigate("/profile/" + user?.id)}
                    className="btn btn-link text-decoration-none"
                    style={{ color: "#667eea" }}
                  >
                    Quay lại profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

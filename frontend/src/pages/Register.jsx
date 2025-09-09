import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FaMusic, FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock } from "react-icons/fa";

export default function Register() {
  const { register, user } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    fullName: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }
    
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    
    setLoading(true);
    try {
      await register({
        email: form.email,
        password: form.password,
        username: form.username,
        fullName: form.fullName,
      });
      navigate("/");
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
          <div className="col-md-6 col-lg-5">
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
                        WebkitTextFillColor: "transparent"
                      }} 
                    />
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                    Tạo tài khoản
                  </h2>
                  <p className="text-muted">Tham gia cộng đồng âm nhạc Repparton</p>
                </div>

                {/* Form đăng ký */}
                <form onSubmit={handleSubmit}>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <small>{error}</small>
                    </div>
                  )}

                  {/* Full Name */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                      Họ và tên
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "#f8f9fa" }}>
                        <FaUser style={{ color: "#667eea" }} />
                      </span>
                      <input
                        type="text"
                        className="form-control border-0"
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        placeholder="Nhập họ và tên"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Username */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                      Tên người dùng
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "#f8f9fa" }}>
                        @
                      </span>
                      <input
                        type="text"
                        className="form-control border-0"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        placeholder="Nhập tên người dùng"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                      Email
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "#f8f9fa" }}>
                        <FaEnvelope style={{ color: "#667eea" }} />
                      </span>
                      <input
                        type="email"
                        className="form-control border-0"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Nhập email"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                      Mật khẩu
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "#f8f9fa" }}>
                        <FaLock style={{ color: "#667eea" }} />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control border-0"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Nhập mật khẩu"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                      <button
                        type="button"
                        className="btn border-0"
                        style={{ background: "#f8f9fa" }}
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEyeSlash style={{ color: "#667eea" }} /> : <FaEye style={{ color: "#667eea" }} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                      Xác nhận mật khẩu
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "#f8f9fa" }}>
                        <FaLock style={{ color: "#667eea" }} />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        className="form-control border-0"
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Nhập lại mật khẩu"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                      <button
                        type="button"
                        className="btn border-0"
                        style={{ background: "#f8f9fa" }}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <FaEyeSlash style={{ color: "#667eea" }} /> : <FaEye style={{ color: "#667eea" }} />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn w-100 py-3 fw-semibold"
                    disabled={loading}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      borderRadius: "10px",
                      color: "white",
                      fontSize: "16px",
                      transition: "transform 0.2s",
                    }}
                    onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
                    onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Đang tạo tài khoản...
                      </>
                    ) : (
                      "Tạo tài khoản"
                    )}
                  </button>
                </form>

                {/* Link to Login */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Đã có tài khoản?{" "}
                    <Link 
                      to="/login" 
                      className="fw-semibold"
                      style={{ 
                        color: "#667eea",
                        textDecoration: "none"
                      }}
                    >
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
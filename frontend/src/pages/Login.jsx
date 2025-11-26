import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { 
  FaMusic, 
  FaEye, 
  FaEyeSlash, 
  FaEnvelope, 
  FaLock
} from "react-icons/fa";

export default function Login() {
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError("Email không được để trống");
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError("Email không hợp lệ");
      return false;
    }
    setEmailError("");
    return true;
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError("Mật khẩu không được để trống");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setLoading(true);
    
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng thử lại.");
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
                {/* Logo & Brand */}
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <img 
                      src="/1.png" 
                      alt="Repparton Logo" 
                      style={{ 
                        width: 64, 
                        height: 64, 
                        objectFit: "contain" 
                      }} 
                    />
                  </div>
                  <h2 className="fw-bold mb-2" style={{ color: "#2c3e50" }}>
                    Repparton
                  </h2>
                  <p className="text-muted">Chào mừng trở lại</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                  {/* Error Message */}
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      <small>{error}</small>
                    </div>
                  )}
                  
                  {/* Email Field */}
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
                        className={`form-control border-0 ${emailError ? 'is-invalid' : ''}`}
                        placeholder="Nhập email của bạn"
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          if (emailError) validateEmail(e.target.value);
                        }}
                        onBlur={e => validateEmail(e.target.value)}
                        required 
                        autoFocus
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                    {emailError && (
                      <small className="text-danger mt-1 d-block">{emailError}</small>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="mb-4">
                    <label className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                      Mật khẩu
                    </label>
                    <div className="input-group">
                      <span className="input-group-text border-0" style={{ background: "#f8f9fa" }}>
                        <FaLock style={{ color: "#667eea" }} />
                      </span>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        className={`form-control border-0 ${passwordError ? 'is-invalid' : ''}`}
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={e => {
                          setPassword(e.target.value);
                          if (passwordError) validatePassword(e.target.value);
                        }}
                        onBlur={e => validatePassword(e.target.value)}
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
                        {showPassword ? 
                          <FaEyeSlash style={{ color: "#667eea" }} /> : 
                          <FaEye style={{ color: "#667eea" }} />
                        }
                      </button>
                    </div>
                    {passwordError && (
                      <small className="text-danger mt-1 d-block">{passwordError}</small>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button 
                    className="btn w-100 py-3 fw-semibold"
                    type="submit" 
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
                        Đang đăng nhập...
                      </>
                    ) : (
                      "Đăng nhập"
                    )}
                  </button>
                </form>

                {/* Sign Up Link */}
                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Chưa có tài khoản?{" "}
                    <Link 
                      to="/register" 
                      className="fw-semibold"
                      style={{ 
                        color: "#667eea",
                        textDecoration: "none"
                      }}
                    >
                      Đăng ký ngay
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
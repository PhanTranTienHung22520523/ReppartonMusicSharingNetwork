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
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: '' });
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 1) return { score, label: 'Yếu', color: '#e74c3c' };
    if (score <= 3) return { score, label: 'Trung bình', color: '#f39c12' };
    return { score, label: 'Mạnh', color: '#27ae60' };
  };

  // Validation functions
  const validateField = (name, value) => {
    const errors = { ...fieldErrors };
    
    switch (name) {
      case 'email':
        if (!value) {
          errors.email = 'Email không được để trống';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Email không hợp lệ';
        } else {
          delete errors.email;
        }
        break;
      
      case 'username':
        if (!value) {
          errors.username = 'Tên người dùng không được để trống';
        } else if (value.length < 3) {
          errors.username = 'Tên người dùng phải có ít nhất 3 ký tự';
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          errors.username = 'Tên người dùng chỉ được chứa chữ, số và dấu gạch dưới';
        } else {
          delete errors.username;
        }
        break;
      
      case 'fullName':
        if (!value) {
          errors.fullName = 'Họ tên không được để trống';
        } else if (value.length < 2) {
          errors.fullName = 'Họ tên phải có ít nhất 2 ký tự';
        } else {
          delete errors.fullName;
        }
        break;
      
      case 'password':
        if (!value) {
          errors.password = 'Mật khẩu không được để trống';
        } else if (value.length < 6) {
          errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        } else {
          delete errors.password;
        }
        setPasswordStrength(calculatePasswordStrength(value));
        break;
      
      case 'confirmPassword':
        if (!value) {
          errors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (value !== form.password) {
          errors.confirmPassword = 'Mật khẩu không khớp';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [name]: value,
    }));
    
    // Real-time validation
    if (fieldErrors[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate all fields
    const isEmailValid = validateField('email', form.email);
    const isUsernameValid = validateField('username', form.username);
    const isFullNameValid = validateField('fullName', form.fullName);
    const isPasswordValid = validateField('password', form.password);
    const isConfirmPasswordValid = validateField('confirmPassword', form.confirmPassword);
    
    if (!isEmailValid || !isUsernameValid || !isFullNameValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError("Vui lòng kiểm tra lại thông tin đăng ký");
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
                        className={`form-control border-0 ${fieldErrors.fullName ? 'is-invalid' : ''}`}
                        name="fullName"
                        value={form.fullName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập họ và tên"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                    {fieldErrors.fullName && (
                      <small className="text-danger mt-1 d-block">{fieldErrors.fullName}</small>
                    )}
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
                        className={`form-control border-0 ${fieldErrors.username ? 'is-invalid' : ''}`}
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập tên người dùng"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                    {fieldErrors.username && (
                      <small className="text-danger mt-1 d-block">{fieldErrors.username}</small>
                    )}
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
                        className={`form-control border-0 ${fieldErrors.email ? 'is-invalid' : ''}`}
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập email"
                        required
                        style={{
                          background: "#f8f9fa",
                          fontSize: "15px"
                        }}
                      />
                    </div>
                    {fieldErrors.email && (
                      <small className="text-danger mt-1 d-block">{fieldErrors.email}</small>
                    )}
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
                        className={`form-control border-0 ${fieldErrors.password ? 'is-invalid' : ''}`}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
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
                    {fieldErrors.password && (
                      <small className="text-danger mt-1 d-block">{fieldErrors.password}</small>
                    )}
                    {form.password && passwordStrength.label && (
                      <div className="mt-2">
                        <small style={{ color: passwordStrength.color, fontWeight: 500 }}>
                          Độ mạnh: {passwordStrength.label}
                        </small>
                        <div className="progress mt-1" style={{ height: 4 }}>
                          <div 
                            className="progress-bar" 
                            style={{ 
                              width: `${(passwordStrength.score / 5) * 100}%`,
                              background: passwordStrength.color
                            }}
                          />
                        </div>
                      </div>
                    )}
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
                        className={`form-control border-0 ${fieldErrors.confirmPassword ? 'is-invalid' : ''}`}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleBlur}
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
                    {fieldErrors.confirmPassword && (
                      <small className="text-danger mt-1 d-block">{fieldErrors.confirmPassword}</small>
                    )}
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
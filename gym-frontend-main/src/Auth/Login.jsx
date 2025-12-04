// src/pages/Login.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../Api/axiosInstance";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Role-based redirect paths (must match .toUpperCase() version of roleName from API)
  const roleRedirectMap = {
    SUPERADMIN: "/superadmin/dashboard",
    ADMIN: "/admin/admin-dashboard",
    GENERALTRAINER: "/generaltrainer/dashboard",
    PERSONALTRAINER: "/personaltrainer/dashboard",
    MEMBER: "/member/dashboard",
    HOUSEKEEPING: "/housekeeping/dashboard",
    RECEPTIONIST: "/receptionist/dashboard",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/auth/login", {
        email: email.trim(),
        password: password,
      });

      const { token, user } = response.data;

      // ✅ Use roleName (not role) — as per your API response
      const normalizedRole = (user.roleName || "").toUpperCase().trim();

      // Save auth info in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRole", normalizedRole);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userId", user.id);

      // Redirect based on role
      const redirectPath = roleRedirectMap[normalizedRole] || "/";
      navigate(redirectPath);
    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Invalid email or password";
      setError(msg);
      // ❌ Removed alert — better UX to show inline error only
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div className="card shadow w-100" style={{ maxWidth: "950px", borderRadius: "1.5rem" }}>
        <div className="row g-0">
          <div className="col-md-6 d-none d-md-block">
            <img
              src="https://hips.hearstapps.com/hmg-prod/images/muscular-man-doing-pushup-exercise-with-dumbbell-royalty-free-image-1728661212.jpg?crop=0.668xw:1.00xh;0.00680xw,0&resize=640:*"
              alt="login"
              className="img-fluid rounded-start"
              style={{ height: "100%", objectFit: "cover" }}
            />
          </div>

          <div className="col-md-6 d-flex align-items-center p-5">
            <div className="w-100">
              <h2 className="fw-bold mb-3 text-center">Welcome Back!</h2>
              <p className="text-muted text-center mb-4">Please login to your account</p>

              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="alert alert-danger mb-3" role="alert">
                    {error}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Email address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>

                <div className="mb-3 position-relative">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      autoComplete="current-password"
                    />
                    <span
                      className="position-absolute top-50 end-0 translate-middle-y pe-3"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer", zIndex: 10 }}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill"></i>
                      ) : (
                        <i className="bi bi-eye-fill"></i>
                      )}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-warning w-100 py-2"
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
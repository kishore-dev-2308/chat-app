import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../../slices/authSlice.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import axios from "axios";
import * as Yup from "yup";

const INIT_STATE = {
  email: "",
  password: "",
  rememberMe: false,
};

const Signinschema = Yup.object().shape({
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loginsubmitref = useRef(null);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    return () => {
      if (loginsubmitref.current) {
        loginsubmitref.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (values) => {
    try {
      setApiError(null);
      loginsubmitref.current = new AbortController();

      const response = await axios.post(`${API_BASE_URL}/auth/login`, values, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        signal: loginsubmitref.current.signal,
      });

      const responseData = response.data;
      if (responseData.success && responseData?.token) {
        dispatch(
          setAuth({
            login: true,
            token: responseData?.token,
          })
        );
        navigate("/");
      } else {
        setApiError(responseData.message || "Invalid email or password");
      }
    } catch (e) {
      if (e.response?.data?.message) {
        setApiError(e.response.data.message);
      } else {
        setApiError("Unable to connect to server. Please try again.");
      }
    }
  };

  const formik = useFormik({
    initialValues: { ...INIT_STATE },
    validationSchema: Signinschema,
    onSubmit: handleSubmit,
  });

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)",
        padding: "24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background ambient lighting accents */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "20%",
          width: "350px",
          height: "350px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "15%",
          right: "20%",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.35)",
          padding: "36px 32px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              fontSize: "26px",
              boxShadow: "0 8px 16px rgba(79, 70, 229, 0.3)",
              marginBottom: "12px",
            }}
          >
            <BsChatDotsFill />
          </div>
          <h3 style={{ fontWeight: 700, color: "#0f172a", marginBottom: "4px" }}>
            Welcome Back
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
            Enter your credentials to access your account
          </p>
        </div>

        {apiError && (
          <div
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              borderRadius: "10px",
              padding: "10px 14px",
              fontSize: "0.875rem",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Email field */}
          <div className="mb-3">
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Email Address
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: formik.touched.email && formik.errors.email ? "1px solid #ef4444" : "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#f8fafc",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ padding: "0 14px", color: "#94a3b8", display: "flex" }}>
                <FaEnvelope size={15} />
              </span>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="email"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "10px 12px 10px 0",
                  fontSize: "0.9rem",
                  color: "#0f172a",
                }}
              />
            </div>
            {formik.touched.email && formik.errors.email && (
              <small style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                {formik.errors.email}
              </small>
            )}
          </div>

          {/* Password field */}
          <div className="mb-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label
                style={{
                  fontSize: "0.825rem",
                  fontWeight: 600,
                  color: "#334155",
                  margin: 0,
                }}
              >
                Password
              </label>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: formik.touched.password && formik.errors.password ? "1px solid #ef4444" : "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#f8fafc",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ padding: "0 14px", color: "#94a3b8", display: "flex" }}>
                <FaLock size={15} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="current-password"
                style={{
                  width: "100%",
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "10px 0",
                  fontSize: "0.9rem",
                  color: "#0f172a",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0 14px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {formik.touched.password && formik.errors.password && (
              <small style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                {formik.errors.password}
              </small>
            )}
          </div>

          {/* Remember me & forgot */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "0.825rem",
                color: "#64748b",
                cursor: "pointer",
                margin: 0,
              }}
            >
              <input
                type="checkbox"
                name="rememberMe"
                checked={formik.values.rememberMe}
                onChange={formik.handleChange}
                style={{ accentColor: "#4f46e5", cursor: "pointer" }}
              />
              Remember me
            </label>
            <span
              style={{
                fontSize: "0.825rem",
                color: "#4f46e5",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Forgot password?
            </span>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={formik.isSubmitting}
            style={{
              width: "100%",
              padding: "11px",
              background: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "10px",
              fontWeight: 600,
              fontSize: "0.925rem",
              cursor: formik.isSubmitting ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(79, 70, 229, 0.35)",
              transition: "all 0.2s ease",
            }}
          >
            {formik.isSubmitting ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer link */}
        <p
          style={{
            textAlign: "center",
            marginTop: "24px",
            marginBottom: 0,
            fontSize: "0.875rem",
            color: "#64748b",
          }}
        >
          Don't have an account?{" "}
          <Link
            to="/sign-up"
            style={{
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign up now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { BsChatDotsFill } from "react-icons/bs";
import axios from "axios";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const RegisterSchema = Yup.object().shape({
  userName: Yup.string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .required("Username is required"),
  email: Yup.string().email("Invalid email address").required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

const Register = () => {
  const navigate = useNavigate();
  const loginsubmitref = useRef(null);
  const [apiError, setApiError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    return () => {
      if (loginsubmitref.current) {
        loginsubmitref.current.abort();
      }
    };
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setApiError(null);
      loginsubmitref.current = new AbortController();

      const response = await axios.post(
        `${API_BASE_URL}/auth/register`,
        {
          username: values.userName,
          email: values.email,
          password: values.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: loginsubmitref.current.signal,
        }
      );

      const responseData = response.data;

      if (responseData.success) {
        const result = await Swal.fire({
          title: "Account Created!",
          text: "Your account has been registered successfully. Proceed to sign in.",
          icon: "success",
          showCancelButton: true,
          confirmButtonColor: "#4f46e5",
          cancelButtonColor: "#94a3b8",
          confirmButtonText: "Sign In",
          cancelButtonText: "Stay Here",
          customClass: {
            popup: "custom-swal-popup",
          },
        });

        if (result.isConfirmed) {
          navigate("/sign-in");
        }
      } else {
        setApiError(responseData.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      if (error.response?.data?.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError("Unable to connect to server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: RegisterSchema,
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
          maxWidth: "440px",
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
            Create an Account
          </h3>
          <p style={{ color: "#64748b", fontSize: "0.875rem", margin: 0 }}>
            Get started with real-time chats and groups
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
            }}
          >
            {apiError}
          </div>
        )}

        <form onSubmit={formik.handleSubmit}>
          {/* Username */}
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
              Username
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: formik.touched.userName && formik.errors.userName ? "1px solid #ef4444" : "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#f8fafc",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ padding: "0 14px", color: "#94a3b8", display: "flex" }}>
                <FaUser size={14} />
              </span>
              <input
                type="text"
                name="userName"
                placeholder="johndoe"
                value={formik.values.userName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="username"
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
            {formik.touched.userName && formik.errors.userName && (
              <small style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                {formik.errors.userName}
              </small>
            )}
          </div>

          {/* Email */}
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
                <FaEnvelope size={14} />
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

          {/* Password */}
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
              Password
            </label>
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
                <FaLock size={14} />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="At least 6 characters"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="new-password"
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

          {/* Confirm Password */}
          <div className="mb-4">
            <label
              style={{
                display: "block",
                fontSize: "0.825rem",
                fontWeight: 600,
                color: "#334155",
                marginBottom: "6px",
              }}
            >
              Confirm Password
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: formik.touched.confirmPassword && formik.errors.confirmPassword ? "1px solid #ef4444" : "1px solid #cbd5e1",
                borderRadius: "10px",
                background: "#f8fafc",
                transition: "all 0.2s ease",
              }}
            >
              <span style={{ padding: "0 14px", color: "#94a3b8", display: "flex" }}>
                <FaLock size={14} />
              </span>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Repeat your password"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                autoComplete="new-password"
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
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  border: "none",
                  background: "transparent",
                  padding: "0 14px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  display: "flex",
                }}
              >
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </button>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <small style={{ color: "#ef4444", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                {formik.errors.confirmPassword}
              </small>
            )}
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
            {formik.isSubmitting ? "Creating account..." : "Sign Up"}
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
          Already have an account?{" "}
          <Link
            to="/sign-in"
            style={{
              color: "#4f46e5",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in now
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;

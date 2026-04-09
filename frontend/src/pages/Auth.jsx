import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Auth() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (tab === "login") {
        await login(email, password);
        navigate("/home");
      } else {
        await signup(email, password);
        setSuccess("Account created. Please sign in.");
        setTab("login");
        setPassword("");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center">
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div
        className="card card-pad z-1 anim-fade-up"
        style={{ width: "100%", maxWidth: "420px" }}
      >
        <div style={{ marginBottom: "1.75rem" }}>
          <h2 style={{ fontSize: "1.6rem", marginBottom: "0.35rem" }}>
            {tab === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {tab === "login"
              ? "Sign in to access your assessments"
              : "Start your wellness journey"}
          </p>
        </div>

        {/* Tab switcher */}
        <div
          style={{
            display: "flex",
            background: "var(--bg-subtle)",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "1.75rem",
            gap: "4px",
          }}
        >
          {["login", "signup"].map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t);
                setError("");
                setSuccess("");
              }}
              style={{
                flex: 1,
                padding: "0.6rem",
                border: "none",
                borderRadius: "9px",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
                fontSize: "0.9rem",
                fontWeight: "500",
                transition: "all 0.2s",
                background: tab === t ? "var(--bg-card)" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: tab === t ? "var(--shadow-sm)" : "none",
              }}
            >
              {t === "login" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              className="input-field"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              className="input-field"
              type="password"
              placeholder={
                tab === "login" ? "Your password" : "Create a password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={
                tab === "login" ? "current-password" : "new-password"
              }
            />
          </div>

          {error && <div className="error-msg mb-2">{error}</div>}
          {success && <div className="success-box mb-2">{success}</div>}

          <button
            className="btn btn-primary btn-full mt-2"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="spinner" />
            ) : tab === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p
          className="text-center text-sm mt-3"
          style={{ color: "var(--text-muted)" }}
        >
          Your responses are private and used only to generate your report.
        </p>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-center" style={{ flexDirection: "column" }}>
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div
        className="z-1"
        style={{ maxWidth: "560px", width: "100%", textAlign: "center" }}
      >
        <div className="anim-fade-up" style={{ marginBottom: "1rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--accent-soft)",
              color: "var(--accent)",
              borderRadius: "999px",
              padding: "0.4rem 1rem",
              fontSize: "0.82rem",
              fontWeight: "500",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
              border: "1px solid var(--accent-mid)",
            }}
          >
            A gentle check-in
          </div>
        </div>

        <h1
          className="anim-fade-up delay-1"
          style={{
            fontSize: "clamp(2.2rem, 5vw, 3.2rem)",
            marginBottom: "1.25rem",
            fontWeight: "600",
          }}
        >
          How are you
          <br />
          <span style={{ color: "var(--accent)", fontStyle: "italic" }}>
            really
          </span>{" "}
          feeling?
        </h1>

        <p
          className="anim-fade-up delay-2"
          style={{
            fontSize: "1.05rem",
            lineHeight: "1.75",
            marginBottom: "2.5rem",
            maxWidth: "420px",
            margin: "0 auto 2.5rem",
          }}
        >
          Validated mental health assessments in a calm, private space.
          Understand your anxiety and mood with the PHQ-9 and GAD-7 tools.
        </p>

        <div
          className="anim-fade-up delay-3"
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            style={{ fontSize: "1rem", padding: "0.9rem 2.2rem" }}
            onClick={() => navigate(user ? "/home" : "/auth")}
          >
            Begin assessment
          </button>
          {!user && (
            <button
              className="btn btn-ghost"
              style={{ fontSize: "1rem", padding: "0.9rem 2.2rem" }}
              onClick={() => navigate("/auth")}
            >
              Sign in
            </button>
          )}
        </div>

        <div
          className="anim-fade-up delay-4"
          style={{
            marginTop: "4rem",
            display: "flex",
            gap: "2.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {[
            { label: "PHQ-9", sub: "Depression screening" },
            { label: "GAD-7", sub: "Anxiety screening" },
            { label: "Private", sub: "Your data stays yours" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.15rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  marginTop: "2px",
                }}
              >
                {item.sub}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

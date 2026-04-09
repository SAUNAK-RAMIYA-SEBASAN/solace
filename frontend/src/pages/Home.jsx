import React from "react";
import { useNavigate } from "react-router-dom";

const TESTS = [
  {
    id: "phq9",
    title: "PHQ-9",
    subtitle: "Depression screening",
    description:
      "The Patient Health Questionnaire helps identify how often you have been bothered by depressive symptoms over the last two weeks.",
    questions: 9,
    duration: "3-5 min",
    color: "var(--sage)",
    soft: "var(--sage-soft)",
  },
  {
    id: "gad7",
    title: "GAD-7",
    subtitle: "Anxiety screening",
    description:
      "The Generalized Anxiety Disorder scale measures how often anxiety-related symptoms have affected you in the past two weeks.",
    questions: 7,
    duration: "2-4 min",
    color: "var(--accent)",
    soft: "var(--accent-soft)",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div
      className="page-center"
      style={{ flexDirection: "column", alignItems: "center" }}
    >
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="z-1" style={{ maxWidth: "680px", width: "100%" }}>
        <div className="anim-fade-up" style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>
            Choose your assessment
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>
            Take your time. These are gentle, validated tools — not a diagnosis.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gap: "1.25rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {TESTS.map((test, i) => (
            <button
              key={test.id}
              className={`card anim-fade-up delay-${i + 1}`}
              onClick={() => navigate(`/assessment/${test.id}`)}
              style={{
                cursor: "pointer",
                padding: "2rem",
                textAlign: "left",
                border: "1.5px solid var(--border)",
                background: "var(--bg-card)",
                transition: "all 0.22s ease",
                fontFamily: "var(--font-body)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                e.currentTarget.style.borderColor = test.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.borderColor = "var(--border)";
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: test.soft,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.25rem",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: test.color,
                    opacity: 0.8,
                  }}
                />
              </div>

              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.4rem",
                  fontWeight: "600",
                  color: "var(--text-primary)",
                  marginBottom: "0.25rem",
                }}
              >
                {test.title}
              </div>
              <div
                style={{
                  fontSize: "0.82rem",
                  color: test.color,
                  fontWeight: "500",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.9rem",
                }}
              >
                {test.subtitle}
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--text-secondary)",
                  lineHeight: "1.6",
                  marginBottom: "1.5rem",
                }}
              >
                {test.description}
              </p>

              <div style={{ display: "flex", gap: "1.25rem" }}>
                {[
                  { label: "Questions", val: test.questions },
                  { label: "Duration", val: test.duration },
                ].map((item) => (
                  <div key={item.label}>
                    <div
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "500",
                        color: "var(--text-primary)",
                      }}
                    >
                      {item.val}
                    </div>
                  </div>
                ))}
              </div>

              <div
                style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: test.color,
                  fontSize: "0.88rem",
                  fontWeight: "500",
                }}
              >
                Begin
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 7h10M8 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        <div
          className="anim-fade-up delay-3"
          style={{
            marginTop: "2.5rem",
            padding: "1.25rem 1.5rem",
            background: "var(--bg-subtle)",
            borderRadius: "14px",
            border: "1px solid var(--border)",
          }}
        >
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--text-muted)",
              lineHeight: "1.65",
            }}
          >
            These tools are for informational purposes only and are not a
            substitute for professional medical advice. If you are in distress,
            please contact a mental health professional.
          </p>
        </div>
      </div>
    </div>
  );
}

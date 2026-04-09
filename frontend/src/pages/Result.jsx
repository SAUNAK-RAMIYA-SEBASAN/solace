import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const SEVERITY_MAP = {
  phq9: [
    { max: 4, level: "minimal", label: "Minimal depression" },
    { max: 9, level: "mild", label: "Mild depression" },
    { max: 14, level: "moderate", label: "Moderate depression" },
    { max: 19, level: "moderate", label: "Moderately severe depression" },
    { max: 27, level: "severe", label: "Severe depression" },
  ],
  gad7: [
    { max: 4, level: "minimal", label: "Minimal anxiety" },
    { max: 9, level: "mild", label: "Mild anxiety" },
    { max: 14, level: "moderate", label: "Moderate anxiety" },
    { max: 21, level: "severe", label: "Severe anxiety" },
  ],
};

function getSeverity(score, type) {
  const map = SEVERITY_MAP[type];
  for (const entry of map) {
    if (score <= entry.max) return entry;
  }
  return map[map.length - 1];
}

const FREQUENCY_LABELS = [
  "Not at all",
  "Several days",
  "More than half the days",
  "Nearly every day",
];

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { result, testType, answers, questions } = state || {};

  const [revealed, setRevealed] = useState(false);
  const [showQuestions, setShowQuestions] = useState(false);

  // If someone lands on /result directly with no state, send them home
  if (!state || !testType) {
    navigate("/home", { replace: true });
    return null;
  }

  // Derive score from result or compute from answers
  const score =
    result?.score ?? answers?.reduce((s, a) => s + (a || 0), 0) ?? 0;
  const severity = getSeverity(score, testType);
  const maxScore = testType === "phq9" ? 27 : 21;
  const isCrisis = testType === "phq9" && score >= 20;

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 300);
    return () => clearTimeout(t);
  }, []);

  const severityColors = {
    minimal: "var(--severity-minimal)",
    mild: "var(--severity-mild)",
    moderate: "var(--severity-moderate)",
    severe: "var(--severity-severe)",
  };

  return (
    <div
      className="page-center"
      style={{ flexDirection: "column", alignItems: "center" }}
    >
      <div className="bg-orb bg-orb-1" />
      <div className="bg-orb bg-orb-2" />

      <div className="z-1" style={{ maxWidth: "560px", width: "100%" }}>
        {/* Score reveal */}
        <div className="card card-pad anim-fade-up text-center">
          <p
            style={{
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
            }}
          >
            Your {testType.toUpperCase()} result
          </p>

          {revealed && (
            <div
              className="score-circle"
              style={{ borderColor: severityColors[severity.level] }}
            >
              <span
                className="score-number"
                style={{ color: severityColors[severity.level] }}
              >
                {score}
              </span>
              <span className="score-label">out of {maxScore}</span>
            </div>
          )}

          <div style={{ marginBottom: "1.25rem" }}>
            <span className={`severity-badge badge-${severity.level}`}>
              {severity.label}
            </span>
          </div>

          <p
            style={{
              fontSize: "0.92rem",
              lineHeight: "1.7",
              color: "var(--text-secondary)",
              maxWidth: "420px",
              margin: "0 auto",
            }}
          >
            {severity.level === "minimal" &&
              "Your responses suggest minimal symptoms at this time. Continue nurturing your wellbeing."}
            {severity.level === "mild" &&
              "Your responses suggest mild symptoms. Consider talking to someone you trust or a professional."}
            {severity.level === "moderate" &&
              "Your responses suggest moderate symptoms. Speaking with a healthcare professional can be a positive step."}
            {severity.level === "severe" &&
              "Your responses suggest significant symptoms. We encourage you to reach out to a mental health professional."}
          </p>

          {/* Email notice */}
          {result?.email_sent && (
            <div className="success-box mt-3">
              A detailed report has been sent to your email address.
            </div>
          )}

          {/* Crisis banner */}
          {isCrisis && (
            <div className="crisis-banner">
              <strong>Support is available</strong>
              Your score suggests you may benefit from speaking with someone
              right away.
              <br />
              iCall (India): <strong>9152987821</strong> — Vandrevala
              Foundation: <strong>1860-2662-345</strong> (24/7)
            </div>
          )}
        </div>

        {/* Score bar */}
        <div
          className="card anim-fade-up delay-1"
          style={{ padding: "1.5rem", marginTop: "1rem" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.82rem",
              color: "var(--text-muted)",
            }}
          >
            <span>0</span>
            <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>
              Score: {score}
            </span>
            <span>{maxScore}</span>
          </div>
          <div
            className="progress-track"
            style={{ height: "8px", borderRadius: "4px" }}
          >
            <div
              className="progress-fill"
              style={{
                width: `${(score / maxScore) * 100}%`,
                background: `linear-gradient(90deg, var(--severity-minimal), ${severityColors[severity.level]})`,
                transition: "width 1s cubic-bezier(0.4,0,0.2,1)",
              }}
            />
          </div>
        </div>

        {/* Response breakdown toggle */}
        {questions && answers && (
          <div className="anim-fade-up delay-2" style={{ marginTop: "1rem" }}>
            <button
              className="btn btn-ghost btn-full"
              onClick={() => setShowQuestions(!showQuestions)}
              style={{ marginBottom: showQuestions ? "0.75rem" : "0" }}
            >
              {showQuestions ? "Hide" : "View"} question breakdown
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                style={{
                  transform: showQuestions ? "rotate(180deg)" : "",
                  transition: "transform 0.2s",
                }}
              >
                <path
                  d="M2 5l5 5 5-5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {showQuestions && (
              <div className="card" style={{ overflow: "hidden" }}>
                {questions.map((q, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1rem 1.25rem",
                      borderBottom:
                        i < questions.length - 1
                          ? "1px solid var(--border)"
                          : "none",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "1rem",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "0.88rem",
                        color: "var(--text-secondary)",
                        lineHeight: "1.5",
                        flex: 1,
                      }}
                    >
                      {typeof q === "string" ? q : q?.text || q?.question || ""}
                    </p>
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: "600",
                          color: "var(--accent)",
                        }}
                      >
                        {answers[i] ?? "–"}
                      </div>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--text-muted)",
                        }}
                      >
                        {FREQUENCY_LABELS[answers[i]] ?? ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div
          className="anim-fade-up delay-3"
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            onClick={() => navigate("/home")}
          >
            Take another assessment
          </button>
          <button
            className="btn btn-ghost"
            style={{ flex: 1 }}
            onClick={() => navigate("/home")}
          >
            Back to home
          </button>
        </div>

        {/* Disclaimer */}
        <p
          className="text-center text-sm mt-3"
          style={{ color: "var(--text-muted)", lineHeight: "1.6" }}
        >
          This result is not a clinical diagnosis. Please consult a qualified
          mental health professional for a proper evaluation.
        </p>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../lib/api";

const FREQUENCY_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
];

const DIFFICULTY_OPTIONS = [
  { value: "not_difficult", label: "Not difficult at all" },
  { value: "somewhat_difficult", label: "Somewhat difficult" },
  { value: "very_difficult", label: "Very difficult" },
  { value: "extremely_difficult", label: "Extremely difficult" },
];

// Fallback questions if API is unavailable
const FALLBACK = {
  phq9: [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling or staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
    "Trouble concentrating on things, such as reading the newspaper or watching television",
    "Moving or speaking so slowly that other people could have noticed, or being so fidgety or restless",
    "Thoughts that you would be better off dead or of hurting yourself in some way",
  ],
  gad7: [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid, as if something awful might happen",
  ],
};

export default function Assessment() {
  const { type: testType } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [difficulty, setDifficulty] = useState(null);
  const [phase, setPhase] = useState("questions"); // 'questions' | 'difficulty' | 'submitting'
  const [animDir, setAnimDir] = useState("enter");
  const [visible, setVisible] = useState(true);
  const [error, setError] = useState("");
  const [loadingQ, setLoadingQ] = useState(true);

  useEffect(() => {
    const fetchQ = async () => {
      try {
        const data =
          testType === "gad7"
            ? await api.getGAD7Questions()
            : await api.getPHQ9Questions();
        // Handle various API response shapes
        const list = Array.isArray(data)
          ? data
          : data.questions || Object.values(data);
        setQuestions(list.length > 0 ? list : FALLBACK[testType]);
      } catch {
        setQuestions(FALLBACK[testType]);
      } finally {
        setLoadingQ(false);
      }
    };
    fetchQ();
  }, [testType]);

  const transition = (cb) => {
    setVisible(false);
    setTimeout(() => {
      cb();
      setVisible(true);
    }, 250);
  };

  const selectAnswer = (val) => {
    const next = [...answers];
    next[current] = val;
    setAnswers(next);

    if (current < questions.length - 1) {
      transition(() => setCurrent(current + 1));
    } else {
      transition(() => setPhase("difficulty"));
    }
  };

  const goBack = () => {
    if (phase === "difficulty") {
      transition(() => setPhase("questions"));
      return;
    }
    if (current > 0) {
      transition(() => setCurrent(current - 1));
    } else {
      navigate("/home");
    }
  };

  const submit = async () => {
    if (!difficulty) return;
    setPhase("submitting");
    try {
      const result = await (testType === "gad7"
        ? api.submitGAD7(
            { test_type: "gad7", responses: answers, difficulty },
            token,
          )
        : api.submitPHQ9(
            { test_type: "phq9", responses: answers, difficulty },
            token,
          ));
      navigate("/result", { state: { result, testType, answers, questions } });
    } catch (err) {
      setError(err.message);
      setPhase("difficulty");
    }
  };

  const totalQ = questions.length;
  const progress = phase === "difficulty" ? 1 : current / totalQ;

  if (loadingQ) {
    return (
      <div className="page-center">
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "2px solid var(--border)",
              borderTopColor: "var(--accent)",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p className="text-muted text-sm">Loading questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="page-center"
      style={{ flexDirection: "column", alignItems: "center" }}
    >
      <div className="bg-orb bg-orb-1" />

      <div className="z-1" style={{ maxWidth: "580px", width: "100%" }}>
        {/* Header */}
        <div className="anim-fade-up" style={{ marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.75rem",
            }}
          >
            <button
              onClick={goBack}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-muted)",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                fontFamily: "var(--font-body)",
                padding: "0.35rem 0",
                transition: "color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--text-primary)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M10 7H2M6 3L2 7l4 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Back
            </button>
            <span
              style={{
                fontSize: "0.82rem",
                color: "var(--text-muted)",
                fontWeight: "500",
              }}
            >
              {phase === "difficulty"
                ? "Final step"
                : `${current + 1} of ${totalQ}`}
            </span>
          </div>

          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {testType.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--accent)",
                fontWeight: "500",
              }}
            >
              {Math.round(progress * 100)}% complete
            </span>
          </div>
        </div>

        {/* Question card */}
        <div
          className="card card-pad"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(10px)",
            transition: "opacity 0.25s ease, transform 0.25s ease",
          }}
        >
          {phase === "questions" && (
            <>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.25rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                Over the last two weeks, how often have you been bothered by...
              </p>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "500",
                  marginBottom: "2rem",
                  lineHeight: "1.5",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {typeof questions[current] === "string"
                  ? questions[current]
                  : questions[current]?.text ||
                    questions[current]?.question ||
                    JSON.stringify(questions[current])}
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`pill-option${answers[current] === opt.value ? " selected" : ""}`}
                    onClick={() => selectAnswer(opt.value)}
                  >
                    <span className="pill-dot">
                      <span className="pill-dot-inner" />
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </>
          )}

          {phase === "difficulty" && (
            <>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--text-muted)",
                  marginBottom: "1.25rem",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                One last question
              </p>
              <h3
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "500",
                  marginBottom: "2rem",
                  lineHeight: "1.5",
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-display)",
                }}
              >
                If you checked off any problems, how difficult have these made
                it to do your work, take care of things at home, or get along
                with other people?
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                {DIFFICULTY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    className={`pill-option${difficulty === opt.value ? " selected" : ""}`}
                    onClick={() => setDifficulty(opt.value)}
                  >
                    <span className="pill-dot">
                      <span className="pill-dot-inner" />
                    </span>
                    {opt.label}
                  </button>
                ))}
              </div>

              {error && <div className="error-msg mt-2">{error}</div>}

              <button
                className="btn btn-primary btn-full mt-3"
                disabled={!difficulty || phase === "submitting"}
                onClick={submit}
                style={{ fontSize: "1rem", padding: "0.9rem" }}
              >
                {phase === "submitting" ? (
                  <span className="spinner" />
                ) : (
                  "Submit assessment"
                )}
              </button>
            </>
          )}
        </div>

        {/* Dot progress indicator */}
        {phase === "questions" && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "6px",
              marginTop: "1.5rem",
            }}
          >
            {questions.map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === current ? "20px" : "6px",
                  height: "6px",
                  borderRadius: "3px",
                  background:
                    i < current
                      ? "var(--accent)"
                      : i === current
                        ? "var(--accent)"
                        : "var(--border)",
                  opacity: i < current ? 0.5 : 1,
                  transition: "all 0.25s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

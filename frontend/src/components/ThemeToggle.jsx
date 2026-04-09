import React from "react";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div className="theme-toggle" role="group" aria-label="Theme switcher">
      {["light", "system", "dark"].map((m) => (
        <button
          key={m}
          className={`theme-btn${mode === m ? " active" : ""}`}
          onClick={() => setMode(m)}
          aria-pressed={mode === m}
        >
          {m.charAt(0).toUpperCase() + m.slice(1)}
        </button>
      ))}
    </div>
  );
}

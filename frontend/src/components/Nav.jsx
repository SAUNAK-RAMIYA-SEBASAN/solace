import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";

export default function Nav({ currentPath }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="nav">
      <div
        className="nav-logo"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(user ? "/home" : "/")}
      >
        Sol<span>ace</span>
      </div>
      <div className="nav-actions">
        <ThemeToggle />
        {user ? (
          <button
            className="btn btn-ghost"
            style={{ padding: "0.55rem 1rem", fontSize: "0.88rem" }}
            onClick={handleLogout}
          >
            Sign out
          </button>
        ) : (
          currentPath !== "/auth" && (
            <button
              className="btn btn-primary"
              style={{ padding: "0.55rem 1rem", fontSize: "0.88rem" }}
              onClick={() => navigate("/auth")}
            >
              Sign in
            </button>
          )
        )}
      </div>
    </nav>
  );
}

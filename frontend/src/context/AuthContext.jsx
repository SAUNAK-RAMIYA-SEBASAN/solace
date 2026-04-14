import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const API_BASE = import.meta.env.VITE_API_BASE || "";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() =>
    localStorage.getItem("solace-token"),
  );
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(
    !!localStorage.getItem("solace-token"),
  );

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => {
        logout();
        setLoading(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const form = new URLSearchParams();
    form.append("username", email);
    form.append("password", password);

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }

    const data = await res.json();
    const t = data.access_token;

    localStorage.setItem("solace-token", t);
    setToken(t);
    setUser({ email });

    return data;
  };

  const signup = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Signup failed");
    }

    return res.json();
  };

  const logout = () => {
    localStorage.removeItem("solace-token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

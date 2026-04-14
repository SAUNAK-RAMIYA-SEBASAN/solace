const BASE = import.meta.env.VITE_API_BASE || "";

async function request(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(BASE + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  getGAD7Questions: () => request("/assessment/gad7/questions"),
  getPHQ9Questions: () => request("/assessment/phq9/questions"),
  submitGAD7: (payload, token) =>
    request(
      "/assessment/gad7",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  submitPHQ9: (payload, token) =>
    request(
      "/assessment/phq9",
      { method: "POST", body: JSON.stringify(payload) },
      token,
    ),
  getMe: (token) => request("/me", {}, token),
};

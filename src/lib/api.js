
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN || "";

export function getAuth() {
  try {
    return JSON.parse(localStorage.getItem("rtx_auth") || "{}");
  } catch {
    return {};
  }
}

function authHeader() {
  const { token } = getAuth();
  const tok = token || DEV_TOKEN;
  return tok ? { Authorization: `Bearer ${tok}` } : {};
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...authHeader(),
    ...(options.headers || {})
  };
  const resp = await fetch(url, { ...options, headers });
  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`HTTP ${resp.status} ${resp.statusText} — ${body}`);
  }
  return resp.headers.get("content-type")?.includes("application/json")
    ? resp.json()
    : resp.text();
}



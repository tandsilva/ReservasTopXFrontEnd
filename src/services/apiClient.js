const BASE = import.meta.env.VITE_API_BASE_URL;
const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN; // opcional

function getToken() {
  try {
    const saved = JSON.parse(localStorage.getItem("rtx_auth") || "{}");
    return saved?.token || DEV_TOKEN || null;
  } catch {
    return DEV_TOKEN || null;
  }
}

export async function api(path, { method = "GET", body, auth = true, headers } = {}) {
  const init = {
    method,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      ...(headers || {})
    },
    credentials: "omit" // mude p/ 'include' se usar cookie httpOnly depois
  };

  const token = getToken();
  if (auth && token) init.headers["Authorization"] = `Bearer ${token}`;
  if (body !== undefined) init.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, init);
  if (res.status === 204) return null;

  let data;
  try { data = await res.json(); } catch { data = null; }

  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || `Erro ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

import { api } from "./apiClient";

export async function login(username, password) {
  // espera que o back responda { token, user }
  const data = await api("/auth/login", {
    method: "POST",
    body: { username, password },
    auth: false
  });

  // normaliza chaves comuns
  const token = data?.token || data?.accessToken || data?.jwt || data?.id_token;
  const user  = data?.user || data?.profile || null;
  if (!token) throw new Error("Login não retornou token");

  localStorage.setItem("rtx_auth", JSON.stringify({ token, user }));
  return { token, user };
}

export function getSession() {
  try { return JSON.parse(localStorage.getItem("rtx_auth") || "{}"); }
  catch { return {}; }
}

export function logout() {
  localStorage.removeItem("rtx_auth");
}

export async function me() {
  return api("/users/me"); // backend deve devolver UserDTO (id, username, role, ...)
}

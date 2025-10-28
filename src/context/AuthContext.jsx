import { createContext, useContext, useEffect, useState } from "react";
import { me } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem("rtx_auth") || "{}"); }
    catch { return {}; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const DEV_TOKEN = import.meta.env.VITE_DEV_TOKEN;

    async function bootstrap() {
      // Se não tem sessão salva, mas tem DEV token -> tenta /users/me
      if ((!auth || !auth.token) && DEV_TOKEN) {
        try {
          const user = await me(); // requer back respondendo UserDTO autenticado
          const next = { token: DEV_TOKEN, user };
          if (mounted) {
            setAuth(next);
            localStorage.setItem("rtx_auth", JSON.stringify(next));
          }
          return;
        } catch { /* ignora, segue sem login */ }
      }

      // Se já tem token salvo -> sincroniza user real
      if (auth?.token) {
        try {
          const user = await me();
          const next = { ...auth, user };
          if (mounted) {
            setAuth(next);
            localStorage.setItem("rtx_auth", JSON.stringify(next));
          }
        } catch {
          if (mounted) {
            setAuth({});
            localStorage.removeItem("rtx_auth");
          }
        }
      }
    }

    bootstrap();
    return () => { mounted = false; };
  }, []); // só uma vez

  async function login(username, password) {
    setLoading(true);
    try {
      // mantém seu fluxo atual de login (via LoginForm -> /auth/login)
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      if (!res.ok) throw new Error("Falha no login");
      const data = await res.json();
      const token = data?.token || data?.accessToken || data?.jwt || data?.id_token;
      const meRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = meRes.ok ? await meRes.json() : (data?.user || null);

      const next = { token, user };
      setAuth(next);
      localStorage.setItem("rtx_auth", JSON.stringify(next));
      return next;
    } finally { setLoading(false); }
  }

  function logout() {
    localStorage.removeItem("rtx_auth");
    setAuth({});
  }

  const isAuthenticated = !!auth?.token;
  const role = auth?.user?.role || auth?.user?.roles?.[0] || null;

  return (
    <AuthContext.Provider value={{ auth, role, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){ return useContext(AuthContext); }

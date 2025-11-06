import { createContext, useContext, useEffect, useState } from "react";
import { me } from "../services/authService";

// ensure a reliable API base is used even when VITE_API_BASE_URL isn't defined
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

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
      // Log do request antes de enviar
      const payload = { 
        username: username.trim(),
        password: password
      };
      console.log("Enviando login para:", `${API_BASE}/auth/login`);
      console.log("Payload:", payload);

      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Origin": window.location.origin
        },
        mode: "cors",
        credentials: "include",
        body: JSON.stringify(payload)
      });
      
      // Log detalhado da resposta
      console.log("Resposta do servidor:", {
        ok: res.ok,
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries([...res.headers]),
        url: res.url
      });
      
      if (!res.ok) {
        const body = await res.text();
        console.error("Login falhou:", { 
          request: {
            url: `${API_BASE}/auth/login`,
            payload
          },
          response: {
            status: res.status,
            statusText: res.statusText,
            body,
            headers: Object.fromEntries([...res.headers])
          }
        });
        throw new Error(`Falha no login (HTTP ${res.status}): ${body}`);
      }

      // Backend retorna exatamente { roles, token, username }
      const data = await res.json();
      console.log("Login bem sucedido:", { 
        username: data.username,
        roles: data.roles,
        tokenLength: data.token?.length
      });
      
      // Extrair token e user info
      const token = data.token;
      const user = {
        username: data.username,
        role: data.roles?.[0] || null,  // pega primeiro role como principal
        roles: data.roles || []
      };

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
  // role já está normalizado no user.role
  const role = auth?.user?.role;
  const roles = auth?.user?.roles || [];

  return (
    <AuthContext.Provider value={{ auth, role, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(){ return useContext(AuthContext); }
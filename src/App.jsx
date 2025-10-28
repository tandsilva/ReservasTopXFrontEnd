import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginForm } from "./components/LoginForm";
import { RegisterPage } from "./RegisterPage.jsx";
import MapaRestaurantes from "./components/MapaRestaurantes";

export default function App() {
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("rtx_auth");
    if (saved) {
      try {
        setAuth(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setAuth(user);
  };

  const handleLogout = () => {
    localStorage.removeItem("rtx_auth");
    setAuth(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route 
          path="/" 
          element={
            auth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginForm onLoginSuccess={handleLoginSuccess} />
            )
          } 
        />
        <Route 
          path="/register" 
          element={
            auth ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage />
            )
          } 
        />

        {/* Rota protegida */}
        <Route 
          path="/dashboard" 
          element={
            auth ? (
              <div className="App" style={{ padding: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <div><strong>Bem-vindo, {auth.username}</strong></div>
                  <button onClick={handleLogout}>Sair</button>
                </div>
                <MapaRestaurantes />
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />

        {/* Redireciona qualquer rota desconhecida */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
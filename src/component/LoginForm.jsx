import React, { useState } from "react";
import { apiFetch } from "../lib/api";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/react.svg';

export function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, role } = useAuth();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Prefer using AuthContext.login so the app has a single auth flow
      const result = await login(username, password);
      // optional callback
      onLoginSuccess?.(result);
      
      // Redireciona baseado no role
      const userRole = result.user.role || result.user.roles?.[0];
      if (userRole === "ROLE_ADMIN") {
        console.log("Admin login - redirecionando para cadastro");
        navigate('/cadastro-juridico');
      } else {
        console.log("User login - redirecionando para mapa");
        navigate('/mapa-restaurantes');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      // surface the real error message when available (helps debugging)
      setError(err?.message || "Falha no login. Verifique usuário/senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px 8px',
      width: '100vw',
      overflowX: 'hidden'
    }}>
      <style>{`
        /* global reset to avoid unexpected overflow and margins */
        html, body, #root {
          margin: 0;
          padding: 0;
          height: 100%;
          box-sizing: border-box;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* prevent horizontal scroll from components that push outside the viewport */
        html, body { overflow-x: hidden; }

        *, *::before, *::after { box-sizing: inherit; }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        .login-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102,126,234,0.08);
        }

        .login-button { transition: all 0.22s cubic-bezier(.2,.9,.3,1); }
        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102,126,234,0.28);
        }
        .login-button:active:not(:disabled){ transform: translateY(0); }

        .login-link{ color:#667eea; text-decoration:none; font-weight:500; transition:color .15s ease }
        .login-link:hover{ color:#764ba2; text-decoration:underline }

        /* semantic class names used on elements below */
        .login-card{ background:white; border-radius:20px; box-shadow:0 20px 60px rgba(0,0,0,0.28); padding:48px 40px; width:100%; max-width:420px; animation:slideIn .45s ease-out }
        .login-logo{ width:80px; height:80px; margin:0 auto 24px; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); border-radius:20px; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(102,126,234,0.3) }
        .login-title{ text-align:center; margin-bottom:8px; font-size:28px; font-weight:700; background:linear-gradient(135deg,#667eea 0%,#764ba2 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text }
        .login-desc{ text-align:center; color:#6b7280; margin-bottom:32px; font-size:14px }

        /* ensure inputs/buttons don't cause horizontal overflow */
        .login-card input, .login-card button { max-width:100%; box-sizing:border-box }

        /* Mobile-first responsive tweaks */
        @media (max-width: 480px) {
          .login-card{ padding:20px; border-radius:14px; margin:0 8px }
          .login-logo{ width:64px; height:64px; border-radius:14px }
          .login-title{ font-size:22px }
          .login-desc{ margin-bottom:20px }
          .login-input{ padding:12px 14px }
          .login-button{ padding:12px; font-size:15px }
        }

        @media (min-width: 481px) and (max-width: 800px) {
          .login-card{ padding:32px }
          .login-title{ font-size:24px }
        }
      `}</style>

      <div className="login-card" style={{
        /* inline styles kept as gentle fallback for older browsers */
        width: '100%',
        maxWidth: '420px'
      }}>
        {/* Logo/Ícone */}
        <div className="login-logo">
          {/* Use an actual SVG asset instead of emoji (emoji may not render on some Linux setups) */}
          <img src={logo} alt="logo" style={{ width: '56px', height: '56px' }} />
        </div>

        <h2 className="login-title">
          Bem-vindo de volta!
        </h2>

        <p className="login-desc">
          Entre com suas credenciais para continuar
        </p>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Usuário
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="login-input"
              style={{
                width: '100%',
                padding: '14px 16px',
                boxSizing: 'border-box',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              placeholder="Digite seu usuário"
              required
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '600',
              color: '#374151',
              fontSize: '14px'
            }}>
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              style={{
                width: '100%',
                padding: '14px 16px',
                boxSizing: 'border-box',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '15px',
                transition: 'all 0.2s ease',
                fontFamily: 'inherit'
              }}
              placeholder="Digite sua senha"
              required
            />
          </div>

          {error && (
            <div style={{
              marginBottom: '20px',
              color: '#dc2626',
              background: '#fee2e2',
              padding: '12px 16px',
              borderRadius: '12px',
              fontSize: '14px',
              border: '1px solid #fecaca',
              animation: 'slideIn 0.3s ease-out'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="login-button"
            style={{
              width: '100%',
              padding: '14px',
              background: loading 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.3)',
              fontFamily: 'inherit'
            }}
          >
            {loading ? (
              <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
                Entrando...
              </span>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          Não tem uma conta?{' '}
        <a href="/register" className="login-link">
            Criar conta
          </a>
        </div>
      </div>
    </div>
  );
}
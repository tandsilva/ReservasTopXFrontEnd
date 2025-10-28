import React, { useState } from "react";
import { apiFetch } from "../lib/api";

export function LoginForm({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      const role =
        data.role ||
        (Array.isArray(data.roles) && data.roles[0]
          ? data.roles[0].replace(/^ROLE_/, "")
          : "USER");

      const auth = { token: data.token, username: data.username, role };
      localStorage.setItem("rtx_auth", JSON.stringify(auth));
      onLoginSuccess?.(auth);
    } catch (err) {
      console.error("Erro no login:", err);
      setError("Falha no login. Verifique usuário/senha.");
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
      padding: '20px'
    }}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .login-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .login-button {
          transition: all 0.3s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }

        .login-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .login-link:hover {
          color: #764ba2;
          text-decoration: underline;
        }
      `}</style>

      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        animation: 'slideIn 0.5s ease-out'
      }}>
        {/* Logo/Ícone */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(102, 126, 234, 0.3)'
        }}>
          <span style={{ fontSize: '40px' }}>🔐</span>
        </div>

        <h2 style={{
          textAlign: 'center',
          marginBottom: '8px',
          fontSize: '28px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Bem-vindo de volta!
        </h2>

        <p style={{
          textAlign: 'center',
          color: '#6b7280',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
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
import React, { useState } from "react";
import { apiFetch } from "./lib/api";

export function RegisterPage() {
  const [step, setStep] = useState("choose"); // choose, user, restaurant
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    telefone: "",
    cpf: "",
    cnpj: "",
    nomeFantasia: "",
    razaoSocial: "",
    categoria: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const formatCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const formatCNPJ = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1");
  };

  const handleCPFChange = (e) => {
    setFormData({ ...formData, cpf: formatCPF(e.target.value) });
  };

  const handleCNPJChange = (e) => {
    setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) });
  };

  const registerUser = async () => {
    setError("");
    setLoading(true);

    try {
      await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          telefone: formData.telefone,
          cpf: formData.cpf.replace(/\D/g, ""),
          role: "USER"
        })
      });

      setSuccess(true);
      setTimeout(() => {
       window.location.href = "/dashboard";
      }, 2000);
    } catch (err) {
      setError(err.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const registerRestaurant = async () => {
    setError("");
    setLoading(true);

    try {
      // 1. Criar User ADMIN
      const userData = await apiFetch("/users", {
        method: "POST",
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          telefone: formData.telefone,
          role: "ADMIN"
        })
      });

      // 2. Criar Restaurant vinculado
      await apiFetch("/restaurants/create", {
        method: "POST",
        body: JSON.stringify({
          userId: userData.id,
          cnpj: formData.cnpj.replace(/\D/g, ""),
          nomeFantasia: formData.nomeFantasia,
          razaoSocial: formData.razaoSocial,
          email: formData.email,
          telefone: formData.telefone,
          categoria: formData.categoria
        })
      });

      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err.message || "Erro ao criar restaurante");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step === "user") {
      registerUser();
    } else if (step === "restaurant") {
      registerRestaurant();
    }
  };

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
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .register-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        .register-button {
          transition: all 0.3s ease;
        }
        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        .choice-card {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        .choice-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        padding: '48px 40px',
        width: '100%',
        maxWidth: step === "choose" ? '600px' : '480px',
        animation: 'slideIn 0.5s ease-out'
      }}>
        {/* Success Message */}
        {success && (
          <div style={{
            marginBottom: '20px',
            padding: '16px',
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '12px',
            color: '#065f46',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            ✓ Conta criada com sucesso! Redirecionando...
          </div>
        )}

        {/* Choose Type */}
        {step === "choose" && (
          <>
            <h2 style={{
              textAlign: 'center',
              marginBottom: '12px',
              fontSize: '28px',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Criar Conta
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '40px',
              fontSize: '14px'
            }}>
              Escolha o tipo de conta que deseja criar
            </p>

            <div style={{ display: 'flex', gap: '20px' }}>
              <div
                className="choice-card"
                onClick={() => setStep("user")}
                style={{
                  flex: 1,
                  padding: '30px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>👤</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Sou Cliente
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Fazer reservas e acumular pontos
                </p>
              </div>

              <div
                className="choice-card"
                onClick={() => setStep("restaurant")}
                style={{
                  flex: 1,
                  padding: '30px 20px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🍽️</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#374151' }}>
                  Sou Restaurante
                </h3>
                <p style={{ fontSize: '13px', color: '#6b7280' }}>
                  Gerenciar reservas e mesas
                </p>
              </div>
            </div>

            <div style={{ marginTop: '32px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
              Já tem uma conta?{' '}
              <a href="/" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '500' }}>
                Fazer login
              </a>
            </div>
          </>
        )}

        {/* User Form */}
        {step === "user" && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '32px' }}>👤</span>
            </div>

            <h2 style={{
              textAlign: 'center',
              marginBottom: '8px',
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151'
            }}>
              Cadastro de Cliente
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '24px',
              fontSize: '13px'
            }}>
              Preencha seus dados para criar sua conta
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Nome de usuário
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  CPF
                </label>
                <input
                  type="text"
                  value={formData.cpf}
                  onChange={handleCPFChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="000.000.000-00"
                  maxLength="14"
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{
                  marginBottom: '16px',
                  color: '#dc2626',
                  background: '#fee2e2',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: '1px solid #fecaca'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="register-button"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}
              >
                {loading ? 'Criando conta...' : 'Criar conta'}
              </button>

              <button
                type="button"
                onClick={() => setStep("choose")}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ← Voltar
              </button>
            </form>
          </>
        )}

        {/* Restaurant Form */}
        {step === "restaurant" && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              margin: '0 auto 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '32px' }}>🍽️</span>
            </div>

            <h2 style={{
              textAlign: 'center',
              marginBottom: '8px',
              fontSize: '24px',
              fontWeight: '700',
              color: '#374151'
            }}>
              Cadastro de Restaurante
            </h2>
            <p style={{
              textAlign: 'center',
              color: '#6b7280',
              marginBottom: '24px',
              fontSize: '13px'
            }}>
              Preencha os dados do seu estabelecimento
            </p>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Nome de usuário do administrador
                </label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  CNPJ
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={handleCNPJChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="00.000.000/0000-00"
                  maxLength="18"
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Nome Fantasia
                </label>
                <input
                  type="text"
                  name="nomeFantasia"
                  value={formData.nomeFantasia}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Razão Social
                </label>
                <input
                  type="text"
                  name="razaoSocial"
                  value={formData.razaoSocial}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Categoria
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="Ex: Pizzaria, Japonês, Italiano..."
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Telefone
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  placeholder="(11) 99999-9999"
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>
                  Senha
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="register-input"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    boxSizing: 'border-box',
                    border: '2px solid #e5e7eb',
                    borderRadius: '10px',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                  required
                />
              </div>

              {error && (
                <div style={{
                  marginBottom: '16px',
                  color: '#dc2626',
                  background: '#fee2e2',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  border: '1px solid #fecaca'
                }}>
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="register-button"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}
              >
                {loading ? 'Criando restaurante...' : 'Criar restaurante'}
              </button>

              <button
                type="button"
                onClick={() => setStep("choose")}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  color: '#6b7280',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                ← Voltar
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
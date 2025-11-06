import React, { useState } from 'react';
import { FaUser, FaLock, FaIdCard, FaPhone, FaEnvelope, FaBuilding } from 'react-icons/fa';

export default function CadastroUsuario() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user',
    cpf: '',
    nomeFantasia: '',
    razaoSocial: '',
    telefone: '',
    email: '',
    pontos: 0
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/user-controller/createUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      alert('Usuário cadastrado com sucesso!');
      console.log(data);
    } catch (error) {
      console.error('Erro ao cadastrar usuário:', error);
    }
  };

  return (
    <div className="form-container">
      <h2>Cadastro de Usuário</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <FaUser /><input name="username" placeholder="Username" onChange={handleChange} />
        </div>
        <div className="input-group">
          <FaLock /><input name="password" type="password" placeholder="Senha" onChange={handleChange} />
        </div>
        <div className="input-group">
          <label>Perfil:</label>
          <select name="role" onChange={handleChange}>
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <div className="input-group">
          <FaIdCard /><input name="cpf" placeholder="CPF" onChange={handleChange} />
        </div>
        <div className="input-group">
          <FaBuilding /><input name="nomeFantasia" placeholder="Nome Fantasia" onChange={handleChange} />
        </div>
        <div className="input-group">
          <FaBuilding /><input name="razaoSocial" placeholder="Razão Social" onChange={handleChange} />
        </div>
        <div className="input-group">
          <FaPhone /><input name="telefone" placeholder="Telefone" onChange={handleChange} />
        </div>
        <div className="input-group">
          <FaEnvelope /><input name="email" placeholder="Email" onChange={handleChange} />
        </div>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  );
}
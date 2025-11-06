import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';

const FormWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  margin: 40px auto;
  background: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
`;

const Title = styled.h2`
  margin-bottom: 20px;
  color: #333;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #0056b3;
  }
`;

export default function CadastroUsuario() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await axios.post('http://localhost:8080/user', {
        ...form,
        role: 'USER'
      });
      alert('Usuário simples criado com sucesso!');
    } catch (error) {
      alert('Erro ao criar usuário simples');
    }
  };

  return (
    <FormWrapper>
      <Title>Cadastro Usuário Simples</Title>
      <Input name="nome" placeholder="Nome" onChange={handleChange} />
      <Input name="email" placeholder="Email" onChange={handleChange} />
      <Input name="senha" type="password" placeholder="Senha" onChange={handleChange} />
      <Button onClick={handleSubmit}>Cadastrar</Button>
    </FormWrapper>
  );
}
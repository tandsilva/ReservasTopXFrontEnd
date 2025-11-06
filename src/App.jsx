import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginForm } from './component/LoginForm';
import { RegisterPage } from './RegisterPage';
import { Navbar } from './component/Navbar';
import { MapaRestaurantes } from './component/MapaRestaurantes';
import { CadastroJuridico } from './component/CadastroJuridico';

// Wrapper para rotas protegidas
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

// Wrapper para rotas públicas (redireciona se já estiver logado)
function PublicRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname || '/'} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <div style={{ paddingTop: '64px' }}> {/* Espaço para o navbar fixo */}
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          } />

          {/* Rotas protegidas */}
          <Route path="/mapa-restaurantes" element={
            <PrivateRoute>
              <MapaRestaurantes />
            </PrivateRoute>
          } />
          <Route path="/cadastro-juridico" element={
            <PrivateRoute>
              <CadastroJuridico />
            </PrivateRoute>
          } />

          {/* Redirecionamentos */}
          <Route path="/" element={<Navigate to="/mapa-restaurantes" replace />} />
          <Route path="*" element={<Navigate to="/mapa-restaurantes" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, logout, auth } = useAuth();
  
  function handleLogout() {
    logout();
    navigate('/login');
  }

  if (!isAuthenticated) return null;

  return (
    <nav style={{
      width: '100%',
      background: 'white',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      padding: '12px 24px',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          fontSize: '20px',
          fontWeight: '600',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ReservasTopX
        </span>
      </div>

      <div style={{ 
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#10B981',
            boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.2)'
          }} />
          <span style={{ 
            color: '#4b5563',
            fontSize: '14px'
          }}>
            {auth?.user?.username ? (
              <>Conectado como <strong>{auth.user.username}</strong></>
            ) : (
              'Conectado'
            )}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseOver={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.25)';
          }}
          onMouseOut={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          <span style={{ fontSize: '16px' }}>↩️</span>
          Sair
        </button>
      </div>
    </nav>
  );
}
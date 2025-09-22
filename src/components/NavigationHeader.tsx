import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface NavigationHeaderProps {
  title: string;
  currentPage?: 'calculator' | 'historial' | 'estadisticas';
}

const NavigationHeader: React.FC<NavigationHeaderProps> = ({ title, currentPage }) => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <div className="calculator-header">
      <div className="navigation">
        <div className="nav-center">
          <Link 
            to="/calculator" 
            className={`nav-link ${currentPage === 'calculator' ? 'active' : ''}`}
          >
            Calculadora
          </Link>
          <Link 
            to="/historial" 
            className={`nav-link ${currentPage === 'historial' ? 'active' : ''}`}
          >
            Historial
          </Link>
          <Link 
            to="/estadisticas" 
            className={`nav-link ${currentPage === 'estadisticas' ? 'active' : ''}`}
          >
            📊 Dashboard
          </Link>
        </div>
        <div className="auth-links">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="nav-link">Iniciar Sesión</Link>
              <Link to="/register" className="nav-link">Registrarse</Link>
            </>
          ) : (
            <button 
              onClick={logout} 
              className="nav-link logout-button"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
      <div className="calculator-title">
        <h1>{title}</h1>
      </div>
    </div>
  );
};

export default NavigationHeader;
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <div className="auth-card-container">
          <h1>Calculadora de IMC</h1>
          <div className="auth-options-card">
            <div className="auth-option">
              <h3>¿Ya tienes cuenta?</h3>
              <p>Accede a tu cuenta</p>
              <Link to="/login" className="btn btn-primary">
                Iniciar Sesión
              </Link>
            </div>
            
            <div className="divider"></div>
            
            <div className="auth-option">
              <h3>¿Primera vez aquí?</h3>
              <p>Crea una nueva cuenta</p>
              <Link to="/register" className="btn btn-secondary">
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

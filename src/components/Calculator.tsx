import React, { useState } from "react";
import { Link } from "react-router-dom";
import { validateAltura, validatePeso, toNumber } from "../utils/validations";
import { calcularIMC, ImcResult } from "../utils/api";
import { useAuth } from "./AuthContext";
import ImcHistorial from "./ImcHistorial";
import './Calculator.css';

type FieldErrors = {
  altura?: string;
  peso?: string;
  general?: string;
};

const Calculator: React.FC = () => {
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [resultado, setResultado] = useState<ImcResult | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [historialKey, setHistorialKey] = useState(Date.now());
  const { isAuthenticated, logout } = useAuth();

  const validateForm = (alturaStr: string, pesoStr: string) => {
    const newErrors: FieldErrors = {
      altura: validateAltura(alturaStr),
      peso: validatePeso(pesoStr),
    };
    setErrors(newErrors);
    return !newErrors.altura && !newErrors.peso;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(null);
    setErrors({});

    if (!validateForm(altura, peso)) return;

    const alturaNum = toNumber(altura);
    const pesoNum = toNumber(peso);

    setIsCalculating(true);

    try {
      const resultadoBackend = await calcularIMC(alturaNum, pesoNum);
      setResultado(resultadoBackend);
      
      // Actualizar el historial después de un cálculo exitoso
      setTimeout(() => {
        setHistorialKey(Date.now());
      }, 500);
    } catch (err: any) {
      setErrors({ general: err.message });
      setResultado(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const onAlturaChange = (v: string) => {
    setAltura(v);
    if (errors.altura) {
      setErrors((prev) => ({ ...prev, altura: validateAltura(v) }));
    }
  };

  const onPesoChange = (v: string) => {
    setPeso(v);
    if (errors.peso) {
      setErrors((prev) => ({ ...prev, peso: validatePeso(v) }));
    }
  };

  const getCategoryColor = (categoria: string) => {
    switch (categoria.toLowerCase()) {
      case 'bajo peso':
        return '#3498db';
      case 'normal':
        return '#27ae60';
      case 'sobrepeso':
        return '#f39c12';
      case 'obesidad':
      case 'obesidad i':
      case 'obesidad ii':
      case 'obesidad iii':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  return (
    <div className="calculator-layout">
      {/* Header */}
      <div className="calculator-header">
        <div className="navigation">
          <Link to="/" className="nav-link">← Volver al inicio</Link>
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
          <img src="/grupo12.jpg" alt="Grupo12" className="grupo" />
          <h1>Calculadora de IMC</h1>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="calculator-content">
        {/* Panel de calculadora */}
        <div className="calculator-panel">
          <div className="calculator-form">
            <h2>Calcular IMC</h2>
            
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label htmlFor="altura">Altura (metros):</label>
                <input
                  id="altura"
                  type="number"
                  value={altura}
                  onChange={(e) => onAlturaChange(e.target.value)}
                  onBlur={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      altura: validateAltura(e.target.value),
                    }))
                  }
                  step="0.01"
                  min="0.01"
                  max="2.99"
                  placeholder="Ej: 1.75"
                  aria-invalid={!!errors.altura}
                  aria-describedby="altura-error"
                  disabled={isCalculating}
                />
                {errors.altura && (
                  <small id="altura-error" className="error-message">
                    {errors.altura}
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="peso">Peso (kilogramos):</label>
                <input
                  id="peso"
                  type="number"
                  value={peso}
                  onChange={(e) => onPesoChange(e.target.value)}
                  onBlur={(e) =>
                    setErrors((prev) => ({
                      ...prev,
                      peso: validatePeso(e.target.value),
                    }))
                  }
                  step="0.1"
                  min="0.1"
                  max="499.9"
                  placeholder="Ej: 70.5"
                  aria-invalid={!!errors.peso}
                  aria-describedby="peso-error"
                  disabled={isCalculating}
                />
                {errors.peso && (
                  <small id="peso-error" className="error-message">
                    {errors.peso}
                  </small>
                )}
              </div>

              <button 
                type="submit" 
                className="calculate-button"
                disabled={isCalculating}
              >
                {isCalculating ? 'Calculando...' : 'Calcular IMC'}
              </button>
            </form>

            {/* Resultado */}
            {resultado && (
              <div className="result-panel">
                <h3>Tu resultado:</h3>
                <div className="result-content">
                  <div className="imc-result">
                    <span className="imc-label">IMC:</span>
                    <span className="imc-value">{resultado.imc.toFixed(2)}</span>
                  </div>
                  <div className="category-result">
                    <span className="category-label">Categoría:</span>
                    <span 
                      className="category-value"
                      style={{ color: getCategoryColor(resultado.categoria) }}
                    >
                      {resultado.categoria}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Error general */}
            {errors.general && (
              <div className="error-panel">
                <p>{errors.general}</p>
              </div>
            )}

            {/* Información sobre el IMC */}
            <div className="imc-info">
              <h3>Categorías del IMC:</h3>
              <div className="category-list">
                <div className="category-item">
                  <span className="category-range">Menos de 18.5</span>
                  <span className="category-name" style={{ color: '#3498db' }}>Bajo peso</span>
                </div>
                <div className="category-item">
                  <span className="category-range">18.5 - 24.9</span>
                  <span className="category-name" style={{ color: '#27ae60' }}>Normal</span>
                </div>
                <div className="category-item">
                  <span className="category-range">25.0 - 29.9</span>
                  <span className="category-name" style={{ color: '#f39c12' }}>Sobrepeso</span>
                </div>
                <div className="category-item">
                  <span className="category-range">30.0 o más</span>
                  <span className="category-name" style={{ color: '#e74c3c' }}>Obesidad</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de historial */}
        <div className="history-panel">
          <ImcHistorial key={historialKey} embedded={true} />
        </div>
      </div>
    </div>
  );
};

export default Calculator;

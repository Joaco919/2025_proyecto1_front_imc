import React, { useEffect, useState } from 'react';
import { getImcHistorial, ImcHistEntry, HistorialFilters } from '../utils/api';
import './ImcHistorial.css';

interface ImcHistorialProps {
  embedded?: boolean; // Para cuando se use dentro de la calculadora
}

const ImcHistorial: React.FC<ImcHistorialProps> = ({ embedded = false }) => {
  const [items, setItems] = useState<ImcHistEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<HistorialFilters>({
    limit: 20
  });

  const loadHistorial = async (newFilters?: HistorialFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getImcHistorial(newFilters || filters);
      setItems(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial();
  }, []);

  const handleFilterChange = (newFilters: Partial<HistorialFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    loadHistorial(updatedFilters);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Fecha inválida';
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

  if (loading) {
    return (
      <div className={embedded ? 'historial-embedded' : 'historial-container'}>
        <div className="loading">Cargando historial...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={embedded ? 'historial-embedded' : 'historial-container'}>
        <div className="error">Error: {error}</div>
        <button onClick={() => loadHistorial()} className="retry-button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={embedded ? 'historial-embedded' : 'historial-container'}>
      <div className="historial-header">
        <h3>Historial de Cálculos</h3>
        <button 
          onClick={() => loadHistorial()} 
          className="refresh-button"
          title="Actualizar historial"
        >
          🔄
        </button>
      </div>

      {/* Filtros */}
      <div className="historial-filters">
        <div className="filter-group">
          <label htmlFor="fechaInicio">Desde:</label>
          <input
            type="date"
            id="fechaInicio"
            value={filters.fechaInicio || ''}
            onChange={(e) => handleFilterChange({ fechaInicio: e.target.value || undefined })}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="fechaFin">Hasta:</label>
          <input
            type="date"
            id="fechaFin"
            value={filters.fechaFin || ''}
            onChange={(e) => handleFilterChange({ fechaFin: e.target.value || undefined })}
          />
        </div>
        <div className="filter-group">
          <label htmlFor="limit">Límite:</label>
          <select
            id="limit"
            value={filters.limit || 20}
            onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <button 
          onClick={() => handleFilterChange({ fechaInicio: undefined, fechaFin: undefined })}
          className="clear-filters-button"
        >
          Limpiar filtros
        </button>
      </div>

      {/* Tabla de historial */}
      <div className="historial-content">
        {items.length === 0 ? (
          <div className="no-data">
            <p>No hay cálculos registrados.</p>
            <p>Realiza tu primer cálculo de IMC para ver el historial.</p>
          </div>
        ) : (
          <div className="historial-table-container">
            <table className="historial-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Peso (kg)</th>
                  <th>Altura (m)</th>
                  <th>IMC</th>
                  <th>Categoría</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{formatDate(item.createdAt || item.fecha)}</td>
                    <td>{item.peso}</td>
                    <td>{item.altura}</td>
                    <td className="imc-value">{item.imc.toFixed(2)}</td>
                    <td>
                      <span 
                        className="categoria-badge"
                        style={{ backgroundColor: getCategoryColor(item.categoria) }}
                      >
                        {item.categoria}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      {items.length > 0 && (
        <div className="historial-stats">
          <div className="stat-item">
            <span className="stat-label">Total de cálculos:</span>
            <span className="stat-value">{items.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">IMC promedio:</span>
            <span className="stat-value">
              {(items.reduce((sum, item) => sum + item.imc, 0) / items.length).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImcHistorial;

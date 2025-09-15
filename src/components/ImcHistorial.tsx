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
    limit: 10
  });
  // Agregamos un contador para forzar actualizaciones
  const [refreshKey, setRefreshKey] = useState(0);

  const loadHistorial = async (newFilters?: HistorialFilters) => {
    setLoading(true);
    setError(null);
    try {
      console.log('=== CARGANDO HISTORIAL ===');
      console.log('Filtros enviados:', newFilters || filters);
      const data = await getImcHistorial(newFilters || filters);
      console.log('Cantidad de datos obtenidos:', data.length);
      console.log('Datos completos:', data);
      if (data.length > 0) {
        console.log('Primera fecha ejemplo:', data[0].createdAt || data[0].fecha);
        console.log('Última fecha ejemplo:', data[data.length - 1].createdAt || data[data.length - 1].fecha);
      }
      console.log('==========================');
      setItems(data);
    } catch (e) {
      console.error('Error cargando historial:', e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Recargar cuando cambien los filtros o el refreshKey
  useEffect(() => {
    loadHistorial(filters);
  }, [filters, refreshKey]);

  const handleFilterChange = (newFilters: Partial<HistorialFilters>) => {
    // Si estamos limpiando filtros, asegurémonos de que sean undefined
    const processedFilters = { ...newFilters };
    
    // Asegurar que si la fecha es vacía, se establece como undefined
    if (processedFilters.hasOwnProperty('fechaInicio') && !processedFilters.fechaInicio) {
      processedFilters.fechaInicio = undefined;
    }
    
    if (processedFilters.hasOwnProperty('fechaFin') && !processedFilters.fechaFin) {
      processedFilters.fechaFin = undefined;
    }
    
    // Sólo actualizamos los filtros, el efecto se encargará de recargar
    const updatedFilters = { ...filters, ...processedFilters };
    console.log('=== DEBUG FILTROS ===');
    console.log('Filtros anteriores:', filters);
    console.log('Nuevos filtros:', newFilters);
    console.log('Filtros finales:', updatedFilters);
    console.log('=====================');
    setFilters(updatedFilters);
    // Utilizamos setRefreshKey para forzar una actualización
    setRefreshKey(prev => prev + 1);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Argentina/Buenos_Aires' // Ajustar según tu zona horaria
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
        <button onClick={() => setRefreshKey(prev => prev + 1)} className="retry-button">
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
          onClick={() => setRefreshKey(prev => prev + 1)} 
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
            value={filters.limit || 10}
            onChange={(e) => handleFilterChange({ limit: parseInt(e.target.value) })}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
          </select>
        </div>
        <button 
          onClick={() => {
            // Restablecemos los filtros y forzamos actualización
            setFilters({
              fechaInicio: undefined, 
              fechaFin: undefined,
              limit: filters.limit 
            });
            // Actualizamos el refreshKey para forzar recarga
            setRefreshKey(prev => prev + 1);
            // Limpiar los campos de fecha visualmente
            const fechaInicioInput = document.getElementById('fechaInicio') as HTMLInputElement;
            const fechaFinInput = document.getElementById('fechaFin') as HTMLInputElement;
            if (fechaInicioInput) fechaInicioInput.value = '';
            if (fechaFinInput) fechaFinInput.value = '';
          }}
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

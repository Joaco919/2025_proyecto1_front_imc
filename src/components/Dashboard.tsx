import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { getEstadisticas, EstadisticasResponse } from '../utils/api';
import NavigationHeader from './NavigationHeader';
import './Dashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
);

interface DashboardProps {
  embedded?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ embedded = false }) => {
  const [estadisticas, setEstadisticas] = useState<EstadisticasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');

  const loadEstadisticas = async (inicio?: string, fin?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEstadisticas(inicio, fin);
      setEstadisticas(data);
    } catch (e) {
      console.error('Error cargando estadísticas:', e);
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEstadisticas();
  }, []);

  const handleFiltrar = () => {
    loadEstadisticas(fechaInicio || undefined, fechaFin || undefined);
  };

  const handleLimpiarFiltros = () => {
    setFechaInicio('');
    setFechaFin('');
    loadEstadisticas();
  };

  // Configuración del gráfico de evolución temporal
  const lineChartData = {
    labels: estadisticas?.evolucionTemporal.map(d => {
      const fecha = new Date(d.fecha);
      return fecha.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }) || [],
    datasets: [
      {
        label: 'IMC',
        data: estadisticas?.evolucionTemporal.map(d => d.imc) || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Peso (kg)',
        data: estadisticas?.evolucionTemporal.map(d => d.peso) || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Evolución de IMC y Peso en el Tiempo',
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Fecha'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'IMC'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Peso (kg)'
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  if (loading) {
    return (
      <>
        {!embedded && (
          <div className="calculator-layout">
            <NavigationHeader title="Dashboard de Estadísticas" currentPage="estadisticas" />
          </div>
        )}
        <div className={embedded ? 'dashboard-embedded' : 'dashboard-container'}>
          <div className="loading">Cargando estadísticas...</div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {!embedded && (
          <div className="calculator-layout">
            <NavigationHeader title="Dashboard de Estadísticas" currentPage="estadisticas" />
          </div>
        )}
        <div className={embedded ? 'dashboard-embedded' : 'dashboard-container'}>
          <div className="error">Error: {error}</div>
          <button onClick={() => loadEstadisticas()} className="retry-button">
            Reintentar
          </button>
        </div>
      </>
    );
  }

  if (!estadisticas || estadisticas.resumen.totalCalculos === 0) {
    return (
      <>
        {!embedded && (
          <div className="calculator-layout">
            <NavigationHeader title="Dashboard de Estadísticas" currentPage="estadisticas" />
          </div>
        )}
        <div className={embedded ? 'dashboard-embedded' : 'dashboard-container'}>
          <div className="no-data">
            <h3>📊 Dashboard de Estadísticas</h3>
            <p>No hay datos suficientes para mostrar estadísticas.</p>
            <p>Realiza algunos cálculos de IMC para ver tus tendencias y análisis.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {!embedded && (
        <div className="calculator-layout">
          <NavigationHeader title="Dashboard de Estadísticas" currentPage="estadisticas" />
        </div>
      )}
      <div className={embedded ? 'dashboard-embedded' : 'dashboard-container'}>

        {/* Filtros de fecha */}
        <div className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="fechaInicio">Desde:</label>
            <input
              type="date"
              id="fechaInicio"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label htmlFor="fechaFin">Hasta:</label>
            <input
              type="date"
              id="fechaFin"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
          <button onClick={handleFiltrar} className="filter-button">
            Filtrar
          </button>
          <button onClick={handleLimpiarFiltros} className="clear-button">
            Limpiar
          </button>
        </div>

        {/* Resumen de estadísticas */}
        <div className="stats-summary">
          <div className="stat-card">
            <h3>
              Total Cálculos
              <span className="stat-tooltip" title="Número total de cálculos realizados por el usuario en el periodo filtrado. Se cuentan todas las entradas registradas.">ℹ️</span>
            </h3>
            <span className="stat-number">{estadisticas.resumen.totalCalculos}</span>
          </div>
          <div className="stat-card">
            <h3>
              IMC Promedio
              <span className="stat-tooltip" title="Promedio aritmético del IMC calculado sobre las entradas del periodo filtrado. Se redondea a 2 decimales.">ℹ️</span>
            </h3>
            <span className="stat-number">{estadisticas.resumen.promedioImc}</span>
          </div>
          <div className="stat-card">
            <h3>
              Peso Promedio
              <span className="stat-tooltip" title="Promedio aritmético del peso (kg) sobre las entradas del periodo filtrado. Se redondea a 2 decimales.">ℹ️</span>
            </h3>
            <span className="stat-number">{estadisticas.resumen.promedioPeso} kg</span>
          </div>
          <div className="stat-card">
            <h3>
              Variación IMC
              <span className="stat-tooltip" title="Diferencia entre el IMC más reciente y el penúltimo IMC registrado (último - penúltimo). Si no hay al menos dos registros, la variación es 0.">ℹ️</span>
            </h3>
            <span className={`stat-number ${estadisticas.resumen.variacionImc >= 0 ? 'positive' : 'negative'}`}>
              {estadisticas.resumen.variacionImc >= 0 ? '+' : ''}{estadisticas.resumen.variacionImc}
            </span>
          </div>
          <div className="stat-card">
            <h3>
              Variación Peso
              <span className="stat-tooltip" title="Diferencia entre el peso más reciente y el penúltimo peso registrado (último - penúltimo). Si no hay al menos dos registros, la variación es 0.">ℹ️</span>
            </h3>
            <span className={`stat-number ${estadisticas.resumen.variacionPeso >= 0 ? 'positive' : 'negative'}`}>
              {estadisticas.resumen.variacionPeso >= 0 ? '+' : ''}{estadisticas.resumen.variacionPeso} kg
            </span>
          </div>
          <div className="stat-card">
            <h3>Rango IMC</h3>
            <span className="stat-number">{estadisticas.resumen.minImc} - {estadisticas.resumen.maxImc}</span>
          </div>
        </div>

        {/* Gráficos */}
        <div className="charts-container">
          {/* Gráfico de evolución temporal */}
          {estadisticas.evolucionTemporal.length > 1 && (
            <div className="chart-section">
              <Line data={lineChartData} options={lineChartOptions} />
            </div>
          )}
        </div>

        {/* Detalles por categoría */}
        <div className="categories-detail">
          <h3>Detalle por Categorías</h3>
          <div className="categories-grid">
            {estadisticas.categorias.map((categoria) => (
              <div key={categoria.categoria} className="category-card">
                <h4>{categoria.categoria}</h4>
                <div className="category-stats">
                  <span className="category-count">{categoria.cantidad} cálculos</span>
                  <span className="category-percentage">{categoria.porcentaje}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
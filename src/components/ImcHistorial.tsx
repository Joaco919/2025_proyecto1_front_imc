import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getImcHistorial, ImcHistEntry } from '../utils/api';

const ImcHistorial: React.FC = () => {
  const [items, setItems] = useState<ImcHistEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getImcHistorial()
      .then(setItems)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando historial...</p>;
  if (error) return <p style={{color:'red'}}>{error}</p>;

  return (
    <div className="form-context">
      <div className="navigation">
        <Link to="/calculator" className="nav-link">← Volver a la calculadora</Link>
      </div>
      <h2>Historial de IMC</h2>
      {items.length === 0 ? (
        <p>No hay registros.</p>
      ) : (
        <ul>
          {items.map((it, idx) => (
            <li key={it.id ?? idx}>
              {it.fecha ? new Date(it.fecha).toLocaleString() : 'Sin fecha'} - IMC: {it.imc} - {it.categoria}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ImcHistorial;

import React, { useState, useEffect } from 'react';
import { obtenerMedicamentos } from './services/medicamentosApi';
import { TablaMedicamentos } from './components/TablaMedicamentos';
import { exportarMedicamentosCSV } from './utils/exportarReporte';

export function MedicamentosView() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarMedicamentos();
  }, []);

  const cargarMedicamentos = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await obtenerMedicamentos();
      setMedicamentos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  // Filtrado dinámico en memoria por nombre o descripción
  const medicamentosFiltrados = medicamentos.filter((med) => {
    const termino = busqueda.toLowerCase();
    const nombreCoincide = med.nombre?.toLowerCase().includes(termino);
    const descCoincide = med.descripcion?.toLowerCase().includes(termino);
    return nombreCoincide || descCoincide;
  });

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Módulo de Medicamentos</h2>

      {/* Buscador y Botón de Exportar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Buscar medicamento por nombre o descripción..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button
          onClick={() => exportarMedicamentosCSV(medicamentosFiltrados)}
          style={{
            backgroundColor: '#16a34a',
            color: '#ffffff',
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Exportar Reporte (CSV)
        </button>
      </div>

      {cargando && <p>Cargando medicamentos...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {!cargando && !error && (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Precio</th>
              <th>ID Proveedor</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <TablaMedicamentos
              medicamentos={medicamentosFiltrados}
              onEditar={(id) => console.log('Editar ID:', id)}
              onEliminar={(id) => console.log('Eliminar ID:', id)}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
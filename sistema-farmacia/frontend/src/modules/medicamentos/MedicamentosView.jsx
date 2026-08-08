import React, { useState, useEffect } from 'react';
import { 
  obtenerMedicamentos, 
  crearMedicamento, 
  actualizarMedicamento, 
  eliminarMedicamento 
} from './services/medicamentosApi';
import { TablaMedicamentos } from './components/TablaMedicamentos';
import { FormularioMedicamento } from './components/FormularioMedicamento';
import { exportarMedicamentosCSV } from './utils/exportarReporte';

export function MedicamentosView() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [medicamentoEditar, setMedicamentoEditar] = useState(null);

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

  const handleGuardar = async (formData) => {
    try {
      if (medicamentoEditar) {
        await actualizarMedicamento(medicamentoEditar.id_medicamento, formData);
      } else {
        await crearMedicamento(formData);
      }
      setMostrarFormulario(false);
      setMedicamentoEditar(null);
      await cargarMedicamentos();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEditar = (id) => {
    const med = medicamentos.find(item => item.id_medicamento === id);
    if (med) {
      setMedicamentoEditar(med);
      setMostrarFormulario(true);
    }
  };

  const handleEliminar = async (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este medicamento?')) {
      try {
        await eliminarMedicamento(id);
        await cargarMedicamentos();
      } catch (err) {
        alert(`Error al eliminar: ${err.message}`);
      }
    }
  };

  const medicamentosFiltrados = medicamentos.filter((med) => {
    const termino = busqueda.toLowerCase();
    const nombreCoincide = med.nombre?.toLowerCase().includes(termino);
    const descCoincide = med.descripcion?.toLowerCase().includes(termino);
    return nombreCoincide || descCoincide;
  });

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>Módulo de Medicamentos</h2>
        <button
          onClick={() => {
            setMedicamentoEditar(null);
            setMostrarFormulario(!mostrarFormulario);
          }}
          style={{ backgroundColor: '#2563eb', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {mostrarFormulario ? 'Cerrar Formulario' : '+ Nuevo Medicamento'}
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioMedicamento
          medicamentoEditar={medicamentoEditar}
          onGuardar={handleGuardar}
          onCancelar={() => {
            setMostrarFormulario(false);
            setMedicamentoEditar(null);
          }}
        />
      )}

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
          style={{ backgroundColor: '#16a34a', color: '#fff', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
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
              onEditar={handleEditar}
              onEliminar={handleEliminar}
            />
          </tbody>
        </table>
      )}
    </div>
  );
}
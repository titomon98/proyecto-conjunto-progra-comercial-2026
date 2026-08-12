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

  // TablaMedicamentos entrega el medicamento completo, no su id.
  const handleEditar = (med) => {
    setMedicamentoEditar(med);
    setMostrarFormulario(true);
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-800 text-2xl font-bold">Gestión de Medicamentos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Catálogo de medicamentos disponibles en la farmacia.
          </p>
        </div>
        <button
          onClick={() => {
            setMedicamentoEditar(null);
            setMostrarFormulario(!mostrarFormulario);
          }}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          {mostrarFormulario ? 'Cerrar formulario' : 'Nuevo Medicamento'}
        </button>
      </div>

      {/* Alerta de error */}
      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

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

      {/* Tarjeta principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Barra de búsqueda y exportación */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
          />
          <button
            onClick={() => exportarMedicamentosCSV(medicamentosFiltrados)}
            className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 sm:ml-auto"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV
          </button>
        </div>

        {/* Tabla / Estados de carga y vacío */}
        {cargando ? (
          <div className="text-center py-12 text-gray-500">
            Cargando medicamentos...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Nombre
                  </th>
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Descripción
                  </th>
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Precio
                  </th>
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    ID Proveedor
                  </th>
                  <th className="bg-gray-50 text-right text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <TablaMedicamentos
                  medicamentos={medicamentosFiltrados}
                  onEditar={handleEditar}
                  onEliminar={handleEliminar}
                />
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

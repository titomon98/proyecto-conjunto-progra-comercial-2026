// frontend/src/modules/inventario/InventarioView.jsx
// Pantalla principal del modulo inventario: existencias por medicamento, alta
// en bodega y ajuste de stock.
//
// La tabla inventario guarda id_medicamento, no el nombre, asi que se cruza con
// /api/medicamentos para que se pueda leer. Los medicamentos que todavia no
// tienen fila de inventario se muestran aparte: hasta que se les de de alta no
// se pueden vender, porque Ventas los toma como stock 0.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  obtenerInventario,
  obtenerMedicamentos,
  crearInventario,
  actualizarInventario,
  eliminarInventario,
} from './inventario.api';
import FormularioInventario from './components/FormularioInventario';

// Debajo de esta cantidad se avisa que el stock esta por agotarse.
const UMBRAL_STOCK_BAJO = 20;

function estadoStock(stock) {
  if (stock <= 0) return { texto: 'Sin stock', clases: 'bg-red-100 text-red-700' };
  if (stock <= UMBRAL_STOCK_BAJO) return { texto: 'Stock bajo', clases: 'bg-amber-100 text-amber-700' };
  return { texto: 'Disponible', clases: 'bg-green-100 text-green-700' };
}

export default function InventarioView() {
  const [inventario, setInventario] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [registroEditar, setRegistroEditar] = useState(null);
  const [idEnProceso, setIdEnProceso] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const [inv, med] = await Promise.all([obtenerInventario(), obtenerMedicamentos()]);
      setInventario(Array.isArray(inv) ? inv : []);
      setMedicamentos(Array.isArray(med) ? med : []);
    } catch (err) {
      setError(err.message || 'No se pudo cargar el inventario');
      setInventario([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const nombrePorMedicamento = useMemo(
    () => new Map(medicamentos.map((m) => [m.id_medicamento, m.nombre])),
    [medicamentos]
  );

  const nombreDe = (idMedicamento) =>
    nombrePorMedicamento.get(idMedicamento) ?? 'Medicamento no encontrado';

  // Medicamentos que todavia no tienen fila en inventario.
  const sinRegistro = useMemo(() => {
    const registrados = new Set(inventario.map((i) => i.id_medicamento));
    return medicamentos.filter((m) => !registrados.has(m.id_medicamento));
  }, [inventario, medicamentos]);

  const filas = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    const conNombre = inventario.map((i) => ({ ...i, nombre: nombreDe(i.id_medicamento) }));
    const filtradas = termino
      ? conNombre.filter((i) => i.nombre.toLowerCase().includes(termino))
      : conNombre;
    return filtradas.sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [inventario, nombrePorMedicamento, busqueda]);

  const totalUnidades = useMemo(
    () => inventario.reduce((acc, i) => acc + Number(i.stock_actual || 0), 0),
    [inventario]
  );

  const abrirCrear = () => {
    setRegistroEditar(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (registro) => {
    setRegistroEditar(registro);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setRegistroEditar(null);
  };

  const handleGuardar = async (datos) => {
    setGuardando(true);
    setError(null);
    try {
      if (registroEditar) {
        await actualizarInventario(registroEditar.id_inventario, datos);
      } else {
        await crearInventario(datos);
      }
      cerrarFormulario();
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el registro');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (registro) => {
    const confirmado = window.confirm(
      `¿Eliminar el registro de inventario de "${nombreDe(registro.id_medicamento)}"? ` +
        'El medicamento dejará de poder venderse hasta que se le dé de alta otra vez.'
    );
    if (!confirmado) return;

    setIdEnProceso(registro.id_inventario);
    setError(null);
    try {
      await eliminarInventario(registro.id_inventario);
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el registro');
    } finally {
      setIdEnProceso(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-800 text-2xl font-bold">Inventario</h1>
          <p className="text-gray-500 text-sm mt-1">
            Existencias en bodega por medicamento.
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Registrar en inventario
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Métricas */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">Medicamentos en bodega</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{inventario.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">Unidades totales</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{totalUnidades}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-4">
          <p className="text-sm text-gray-500">Sin registro de bodega</p>
          <p className="mt-1 text-2xl font-semibold text-gray-800">{sinRegistro.length}</p>
        </div>
      </div>

      {/* Aviso de medicamentos sin bodega: no se pueden vender */}
      {!cargando && sinRegistro.length > 0 && (
        <div className="bg-amber-100 text-amber-700 rounded-lg px-4 py-3 mb-6 text-sm">
          <span className="font-medium">
            {sinRegistro.length}{' '}
            {sinRegistro.length === 1 ? 'medicamento no tiene' : 'medicamentos no tienen'} registro
            de inventario
          </span>{' '}
          y por eso no se pueden vender: {sinRegistro.map((m) => m.nombre).join(', ')}.
        </div>
      )}

      {/* Tarjeta principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar por medicamento..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Medicamento
                </th>
                <th className="bg-gray-50 text-right text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Stock actual
                </th>
                <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Estado
                </th>
                <th className="bg-gray-50 text-right text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    Cargando inventario...
                  </td>
                </tr>
              )}

              {!cargando && filas.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {busqueda
                      ? 'Ningún medicamento coincide con la búsqueda.'
                      : 'Todavía no hay medicamentos dados de alta en bodega.'}
                  </td>
                </tr>
              )}

              {!cargando &&
                filas.map((registro) => {
                  const estado = estadoStock(Number(registro.stock_actual || 0));
                  return (
                    <tr
                      key={registro.id_inventario}
                      className="border-b border-gray-200 hover:bg-gray-50/50"
                    >
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {registro.nombre}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 text-right font-medium">
                        {registro.stock_actual}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${estado.clases}`}
                        >
                          {estado.texto}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-3">
                        <button
                          onClick={() => abrirEditar(registro)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ajustar
                        </button>
                        <button
                          onClick={() => handleEliminar(registro)}
                          disabled={idEnProceso === registro.id_inventario}
                          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                        >
                          {idEnProceso === registro.id_inventario ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {formularioAbierto && (
        <FormularioInventario
          registroEditar={registroEditar}
          medicamentosDisponibles={sinRegistro}
          nombreMedicamento={registroEditar ? nombreDe(registroEditar.id_medicamento) : ''}
          onGuardar={handleGuardar}
          onCerrar={cerrarFormulario}
          guardando={guardando}
        />
      )}
    </div>
  );
}

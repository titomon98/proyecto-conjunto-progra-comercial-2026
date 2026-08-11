// frontend/src/modules/clientes/ClientesView.jsx
// Pantalla principal del modulo clientes: listado, alta, edicion y borrado.
//
// Los clientes son la contraparte de las ventas: sin un cliente registrado no
// se puede facturar. Por eso el borrado esta protegido en el backend, que
// responde 409 si el cliente ya tiene ventas.

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  obtenerClientes,
  crearCliente,
  actualizarCliente,
  eliminarCliente,
} from './clientes.api';
import FormularioCliente from './components/FormularioCliente';

export default function ClientesView() {
  const [clientes, setClientes] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [formularioAbierto, setFormularioAbierto] = useState(false);
  const [clienteEditar, setClienteEditar] = useState(null);
  const [idEnProceso, setIdEnProceso] = useState(null);

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerClientes();
      setClientes(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los clientes');
      setClientes([]);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const mostrarExito = (mensaje) => {
    setExito(mensaje);
    setTimeout(() => setExito(null), 3000);
  };

  const clientesFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();
    if (!termino) return clientes;
    return clientes.filter(
      (c) =>
        (c.nombre || '').toLowerCase().includes(termino) ||
        (c.nit || '').toLowerCase().includes(termino)
    );
  }, [clientes, busqueda]);

  const abrirCrear = () => {
    setClienteEditar(null);
    setFormularioAbierto(true);
  };

  const abrirEditar = (cliente) => {
    setClienteEditar(cliente);
    setFormularioAbierto(true);
  };

  const cerrarFormulario = () => {
    setFormularioAbierto(false);
    setClienteEditar(null);
  };

  const handleGuardar = async (datos) => {
    setGuardando(true);
    setError(null);
    try {
      if (clienteEditar) {
        await actualizarCliente(clienteEditar.id_cliente, datos);
        mostrarExito('Cliente actualizado correctamente.');
      } else {
        await crearCliente(datos);
        mostrarExito('Cliente creado correctamente.');
      }
      cerrarFormulario();
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo guardar el cliente');
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (cliente) => {
    const confirmado = window.confirm(
      `¿Eliminar a "${cliente.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setIdEnProceso(cliente.id_cliente);
    setError(null);
    try {
      await eliminarCliente(cliente.id_cliente);
      mostrarExito('Cliente eliminado correctamente.');
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el cliente');
    } finally {
      setIdEnProceso(null);
    }
  };

  const fechaCorta = (valor) =>
    valor ? new Date(valor).toLocaleDateString('es-GT') : '—';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-800 text-2xl font-bold">Clientes</h1>
          <p className="text-gray-500 text-sm mt-1">
            {clientes.length} {clientes.length === 1 ? 'cliente registrado' : 'clientes registrados'}
          </p>
        </div>
        <button
          onClick={abrirCrear}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo cliente
        </button>
      </div>

      {/* Alertas */}
      {exito && (
        <div className="bg-green-100 text-green-700 border border-green-200 rounded-lg px-4 py-3 mb-6">
          {exito}
        </div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Tarjeta principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar por nombre o NIT..."
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
                  Nombre
                </th>
                <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  NIT
                </th>
                <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Registrado
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
                    Cargando clientes...
                  </td>
                </tr>
              )}

              {!cargando && clientesFiltrados.length === 0 && !error && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                    {busqueda
                      ? 'Ningún cliente coincide con la búsqueda.'
                      : 'Todavía no hay clientes registrados.'}
                  </td>
                </tr>
              )}

              {!cargando &&
                clientesFiltrados.map((cliente) => (
                  <tr
                    key={cliente.id_cliente}
                    className="border-b border-gray-200 hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {cliente.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                      {cliente.nit}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {fechaCorta(cliente.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-3">
                      <button
                        onClick={() => abrirEditar(cliente)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleEliminar(cliente)}
                        disabled={idEnProceso === cliente.id_cliente}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {idEnProceso === cliente.id_cliente ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {formularioAbierto && (
        <FormularioCliente
          clienteEditar={clienteEditar}
          onGuardar={handleGuardar}
          onCerrar={cerrarFormulario}
          guardando={guardando}
        />
      )}
    </div>
  );
}

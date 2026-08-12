// frontend/src/modules/proveedores/ProveedoresPage.jsx
//
// Pantalla principal del modulo: tabla, busqueda y paginacion.
// Sigue la linea grafica obligatoria del CONTRATO.md §7.
//
// La tabla proveedores solo tiene nombre y contacto, asi que no hay columnas de
// telefono/email ni badge de estado: sin columna `activo` no existe el borrado
// logico. El DELETE es fisico y el backend lo bloquea con 409 si el proveedor
// tiene medicamentos asociados.

import { useCallback, useEffect, useState } from 'react';
import { listarProveedores, eliminarProveedor } from './proveedores.api';
import ProveedorForm from './ProveedorForm';

const LIMITE_POR_PAGINA = 10;

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [idEnProceso, setIdEnProceso] = useState(null);
  const [proveedorEnEdicion, setProveedorEnEdicion] = useState(null);
  const [formularioAbierto, setFormularioAbierto] = useState(false);

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE_POR_PAGINA));

  const cargar = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const resultado = await listarProveedores({
        pagina,
        limite: LIMITE_POR_PAGINA,
        busqueda: busqueda || undefined,
      });
      setProveedores(resultado.datos);
      setTotal(resultado.total);
    } catch (err) {
      setError(err.message || 'No se pudieron cargar los proveedores');
      setProveedores([]);
      setTotal(0);
    } finally {
      setCargando(false);
    }
  }, [pagina, busqueda]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  // Debounce simple de la búsqueda: espera 400ms sin teclear antes de disparar.
  useEffect(() => {
    const temporizador = setTimeout(() => {
      setPagina(1);
      setBusqueda(busquedaInput.trim());
    }, 400);
    return () => clearTimeout(temporizador);
  }, [busquedaInput]);

  function abrirCrear() {
    setProveedorEnEdicion(null);
    setFormularioAbierto(true);
  }

  function abrirEditar(proveedor) {
    setProveedorEnEdicion(proveedor);
    setFormularioAbierto(true);
  }

  function cerrarFormulario() {
    setFormularioAbierto(false);
    setProveedorEnEdicion(null);
  }

  async function manejarGuardado() {
    cerrarFormulario();
    await cargar();
  }

  async function manejarEliminar(proveedor) {
    const confirmado = window.confirm(
      `¿Eliminar a "${proveedor.nombre}"? Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    setIdEnProceso(proveedor.id_proveedor);
    setError(null);
    try {
      await eliminarProveedor(proveedor.id_proveedor);
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo eliminar el proveedor');
    } finally {
      setIdEnProceso(null);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-800 text-2xl font-bold">Proveedores</h1>
          <p className="text-gray-500 text-sm mt-1">
            {total} {total === 1 ? 'proveedor registrado' : 'proveedores registrados'}
          </p>
        </div>

        <button
          type="button"
          onClick={abrirCrear}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo proveedor
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* Tarjeta principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            value={busquedaInput}
            onChange={(e) => setBusquedaInput(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full sm:max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Nombre
                </th>
                <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Contacto
                </th>
                <th className="bg-gray-50 text-right text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cargando && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    Cargando proveedores...
                  </td>
                </tr>
              )}

              {!cargando && proveedores.length === 0 && !error && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                    {busqueda
                      ? 'No hay proveedores que coincidan con la búsqueda.'
                      : 'Todavía no hay proveedores registrados.'}
                  </td>
                </tr>
              )}

              {!cargando &&
                proveedores.map((proveedor) => (
                  <tr
                    key={proveedor.id_proveedor}
                    className="border-b border-gray-200 hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                      {proveedor.nombre}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {proveedor.contacto || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-right space-x-3">
                      <button
                        type="button"
                        onClick={() => abrirEditar(proveedor)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => manejarEliminar(proveedor)}
                        disabled={idEnProceso === proveedor.id_proveedor}
                        className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                      >
                        {idEnProceso === proveedor.id_proveedor ? 'Eliminando...' : 'Eliminar'}
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            Página {pagina} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={pagina <= 1 || cargando}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={pagina >= totalPaginas || cargando}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {formularioAbierto && (
        <ProveedorForm
          proveedor={proveedorEnEdicion}
          onCerrar={cerrarFormulario}
          onGuardado={manejarGuardado}
        />
      )}
    </div>
  );
}

// frontend/src/modules/proveedores/ProveedoresPage.jsx
//
// Dueña: Integrante B — pantalla principal del módulo: tabla, paginación,
// búsqueda y filtro por estado. Sigue la línea gráfica obligatoria del
// CONTRATO.md §7 (fondo slate-50, primario blue-600, badges de estado, etc).
//
// Depende de:
//   - ./proveedores.api.js        (capa HTTP — hoy prestado por B, dueño real: A)
//   - ./ProveedorForm.jsx         (modal crear/editar — dueño: C, aún no entregado)
//
// Mientras C no entregue ProveedorForm.jsx, el botón "Nuevo proveedor" y
// "Editar" quedan deshabilitados con un aviso, para no bloquear tu propia
// pantalla. Cuando C lo entregue, descomenta el import y los botones.

import { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Ban, RotateCw, Plus } from 'lucide-react';
import { listarProveedores, desactivarProveedor } from './proveedores.api';
import ProveedorForm from './ProveedorForm';

const LIMITE_POR_PAGINA = 10;

const ESTADOS_FILTRO = [
  { valor: 'true', etiqueta: 'Activos' },
  { valor: 'false', etiqueta: 'Inactivos' },
  { valor: 'todos', etiqueta: 'Todos' },
];

function BadgeEstado({ activo }) {
  const clases = activo
    ? 'bg-green-100 text-green-700'
    : 'bg-red-100 text-red-700';
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${clases}`}>
      {activo ? 'Activo' : 'Inactivo'}
    </span>
  );
}

export default function ProveedoresPage() {
  const [proveedores, setProveedores] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [busquedaInput, setBusquedaInput] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [filtroActivo, setFiltroActivo] = useState('true');
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
        activo: filtroActivo === 'todos' ? 'todos' : filtroActivo === 'true',
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
  }, [pagina, busqueda, filtroActivo]);

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

  async function manejarDesactivar(proveedor) {
    const confirmado = window.confirm(
      `¿Desactivar a "${proveedor.nombre}"? Podrás seguir viéndolo con el filtro "Inactivos".`
    );
    if (!confirmado) return;

    setIdEnProceso(proveedor.id_proveedor);
    try {
      await desactivarProveedor(proveedor.id_proveedor);
      await cargar();
    } catch (err) {
      setError(err.message || 'No se pudo desactivar el proveedor');
    } finally {
      setIdEnProceso(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Proveedores</h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} {total === 1 ? 'proveedor registrado' : 'proveedores registrados'}
            </p>
          </div>

          <button
            type="button"
            onClick={abrirCrear}
            className="inline-flex items-center gap-2 bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors"
          >
            <Plus size={16} />
            Nuevo proveedor
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Barra de búsqueda y filtro */}
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                placeholder="Buscar por nombre..."
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <select
              value={filtroActivo}
              onChange={(e) => {
                setPagina(1);
                setFiltroActivo(e.target.value);
              }}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {ESTADOS_FILTRO.map((estado) => (
                <option key={estado.valor} value={estado.valor}>
                  {estado.etiqueta}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="mx-4 mt-4 bg-amber-100 text-amber-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium">Contacto</th>
                  <th className="px-4 py-3 font-medium">Teléfono</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {cargando && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      Cargando proveedores...
                    </td>
                  </tr>
                )}

                {!cargando && proveedores.length === 0 && !error && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-gray-500">
                      No hay proveedores que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}

                {!cargando &&
                  proveedores.map((proveedor) => (
                    <tr
                      key={proveedor.id_proveedor}
                      className="border-b border-gray-200 hover:bg-gray-50/50"
                    >
                      <td className="px-4 py-3 text-gray-800 font-medium">{proveedor.nombre}</td>
                      <td className="px-4 py-3 text-gray-800">{proveedor.contacto || '—'}</td>
                      <td className="px-4 py-3 text-gray-800">{proveedor.telefono || '—'}</td>
                      <td className="px-4 py-3 text-gray-800">{proveedor.email || '—'}</td>
                      <td className="px-4 py-3">
                        <BadgeEstado activo={proveedor.activo} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => abrirEditar(proveedor)}
                            className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors"
                          >
                            Editar
                          </button>

                          {proveedor.activo ? (
                            <button
                              type="button"
                              onClick={() => manejarDesactivar(proveedor)}
                              disabled={idEnProceso === proveedor.id_proveedor}
                              className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                              <Ban size={13} />
                              {idEnProceso === proveedor.id_proveedor ? 'Desactivando...' : 'Desactivar'}
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-gray-500 text-xs px-3 py-1.5">
                              <RotateCw size={13} />
                              Reactivar (pendiente)
                            </span>
                          )}
                        </div>
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
                className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                disabled={pagina >= totalPaginas || cargando}
                className="inline-flex items-center gap-1 bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-xs hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
                <ChevronRight size={14} />
              </button>
            </div>
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
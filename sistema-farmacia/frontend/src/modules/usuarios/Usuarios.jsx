import { useState, useEffect } from 'react';
import UsuarioForm from './UsuarioForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Usuarios({ onLogout }) {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // Modal state for UsuarioForm
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [guardando, setGuardando] = useState(false);

  // Modal state for delete confirmation
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const mostrarExito = (msg) => {
    setExito(msg);
    setTimeout(() => {
      setExito('');
    }, 3000);
  };

  const mostrarError = (msg) => {
    setError(msg);
    setTimeout(() => {
      setError('');
    }, 3000);
  };

  const fetchUsuarios = async () => {
    setCargando(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/usuarios`, {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.mensaje || 'Error al cargar la lista de usuarios');
      }

      const data = await response.json();
      setUsuarios(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Error al cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleNuevoUsuario = () => {
    setUsuarioSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEditarUsuario = (u) => {
    setUsuarioSeleccionado(u);
    setModalAbierto(true);
  };

  const handleGuardar = async (datosFormulario) => {
    setGuardando(true);
    try {
      const token = localStorage.getItem('token');
      const esEdicion = Boolean(datosFormulario.id_usuario);
      const url = esEdicion
        ? `${API_URL}/usuarios/${datosFormulario.id_usuario}`
        : `${API_URL}/usuarios`;
      const method = esEdicion ? 'PUT' : 'POST';

      const payload = {
        email: datosFormulario.email,
        rol: datosFormulario.rol,
      };

      if (datosFormulario.password) {
        payload.password = datosFormulario.password;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || resData.mensaje || 'Error al guardar el usuario');
      }

      setModalAbierto(false);
      mostrarExito(
        esEdicion
          ? 'Usuario actualizado exitosamente.'
          : 'Usuario creado exitosamente.'
      );
      await fetchUsuarios();
    } catch (err) {
      mostrarError(err.message || 'Error al procesar la solicitud');
    } finally {
      setGuardando(false);
    }
  };

  const handleConfirmarEliminar = (u) => {
    setUsuarioAEliminar(u);
  };

  const handleEliminar = async () => {
    if (!usuarioAEliminar) return;
    setEliminando(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/usuarios/${usuarioAEliminar.id_usuario}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.error || resData.mensaje || 'Error al eliminar el usuario');
      }

      setUsuarioAEliminar(null);
      mostrarExito('Usuario eliminado correctamente.');
      await fetchUsuarios();
    } catch (err) {
      mostrarError(err.message || 'Error al eliminar el usuario');
    } finally {
      setEliminando(false);
    }
  };

  const usuariosFiltrados = usuarios.filter((u) => {
    const term = busqueda.toLowerCase();
    const email = (u.email || '').toLowerCase();
    const rol = (u.rol || '').toLowerCase();
    return email.includes(term) || rol.includes(term);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-gray-800 text-2xl font-bold">Gestión de Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">
            Administre los usuarios del sistema y sus roles.
          </p>
        </div>
        <button
          onClick={handleNuevoUsuario}
          className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors inline-flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Nuevo Usuario
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

      {/* Tarjeta / Contenedor principal */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Barra de búsqueda */}
        <div className="p-4 border-b border-gray-200">
          <input
            type="text"
            placeholder="Buscar por correo o rol..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full sm:max-w-xs px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm text-gray-800"
          />
        </div>

        {/* Tabla / Estados de carga y vacío */}
        {cargando ? (
          <div className="text-center py-12 text-gray-500">
            Cargando...
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No hay usuarios registrados
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Correo
                  </th>
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Rol
                  </th>
                  <th className="bg-gray-50 text-left text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Fecha
                  </th>
                  <th className="bg-gray-50 text-right text-sm font-medium text-gray-500 uppercase tracking-wider px-6 py-3">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usuariosFiltrados.map((u) => {
                  const fechaFormateada = u.created_at
                    ? new Date(u.created_at).toLocaleDateString('es-GT')
                    : '-';

                  return (
                    <tr key={u.id_usuario} className="border-b border-gray-200 hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {u.rol || 'Sin rol'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800">
                        {fechaFormateada}
                      </td>
                      <td className="px-6 py-4 text-sm text-right space-x-3">
                        <button
                          onClick={() => handleEditarUsuario(u)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleConfirmarEliminar(u)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal UsuarioForm */}
      {modalAbierto && (
        <UsuarioForm
          usuario={usuarioSeleccionado}
          onGuardar={handleGuardar}
          onCerrar={() => setModalAbierto(false)}
          guardando={guardando}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      {usuarioAEliminar && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md p-6">
            <h3 className="text-gray-800 text-lg font-bold mb-2">
              Confirmar eliminación
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              ¿Está seguro de que desea eliminar al usuario <strong className="text-gray-800">{usuarioAEliminar.email}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setUsuarioAEliminar(null)}
                disabled={eliminando}
                className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleEliminar}
                disabled={eliminando}
                className="bg-red-600 text-white rounded-md px-4 py-2 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {eliminando ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
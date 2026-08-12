import { useState, useEffect } from 'react';

export default function UsuarioForm({
  usuario = null,
  onGuardar,
  onCerrar,
  guardando = false,
}) {
  // La tabla usuarios solo tiene email, password y rol.
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Vendedor');
  const [error, setError] = useState('');

  const esEdicion = Boolean(usuario && usuario.id_usuario);

  useEffect(() => {
    if (usuario) {
      setEmail(usuario.email || '');
      setRol(usuario.rol || 'Vendedor');
      setPassword('');
    } else {
      setEmail('');
      setRol('Vendedor');
      setPassword('');
    }
    setError('');
  }, [usuario]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const emailTrim = email.trim();

    if (!emailTrim) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      setError('Por favor, ingrese un correo electrónico válido.');
      return;
    }

    if (!esEdicion && !password) {
      setError('La contraseña es obligatoria para nuevos usuarios.');
      return;
    }

    const datosFormulario = {
      email: emailTrim,
      rol: rol,
    };

    if (esEdicion) {
      datosFormulario.id_usuario = usuario.id_usuario;
    }

    if (password) {
      datosFormulario.password = password;
    }

    if (onGuardar) {
      onGuardar(datosFormulario);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !guardando) {
      onCerrar();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-lg p-6 relative">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-gray-100 mb-5">
          <div>
            <h2 className="text-gray-800 text-xl font-semibold">
              {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {esEdicion
                ? 'Actualice la información del usuario seleccionado.'
                : 'Ingrese las credenciales y el rol del nuevo usuario.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            aria-label="Cerrar modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 mb-5 text-sm flex items-start gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Correo electrónico */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Correo electrónico <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              disabled={guardando}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Contraseña {!esEdicion && <span className="text-red-500">*</span>}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={esEdicion ? '••••••••' : 'Mínimo 6 caracteres'}
              className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              disabled={guardando}
            />
            {esEdicion && (
              <p className="text-xs text-gray-500 mt-1">
                Dejar vacío para mantener la actual
              </p>
            )}
          </div>

          {/* Rol */}
          <div>
            <label
              htmlFor="rol"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Rol <span className="text-red-500">*</span>
            </label>
            <select
              id="rol"
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              disabled={guardando}
            >
              {/* Valores tal como estan escritos en la columna rol de la tabla. */}
              <option value="Administrador">Administrador</option>
              <option value="Vendedor">Vendedor</option>
              <option value="Bodega">Bodega</option>
              <option value="Supervisor">Supervisor</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {guardando && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {guardando ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

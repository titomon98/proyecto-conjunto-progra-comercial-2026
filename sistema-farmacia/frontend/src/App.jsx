// Componente raiz de la aplicacion.
// Gestiona el flujo de autenticacion: Login o vista principal de Usuarios.

import { useState, useEffect } from 'react';
import Login from './modules/usuarios/Login';
import Usuarios from './modules/usuarios/Usuarios';

export default function App() {
  const [token, setToken] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);

  // ── Leer sesion guardada al montar ──
  useEffect(() => {
    const tokenGuardado = localStorage.getItem('token');
    const usuarioGuardado = localStorage.getItem('usuario');

    if (tokenGuardado) {
      setToken(tokenGuardado);
    }
    if (usuarioGuardado) {
      try {
        setUsuarioActual(JSON.parse(usuarioGuardado));
      } catch {
        localStorage.removeItem('usuario');
      }
    }
  }, []);

  // ── Login exitoso ──
  const handleLoginSuccess = (data) => {
    setToken(data.token);
    setUsuarioActual(data.usuario);
  };

  // ── Cerrar sesion ──
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuarioActual(null);
  };

  // ── Sin token: mostrar Login ──
  if (token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // ── Con token: mostrar aplicacion ──
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Titulo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Sistema de Farmacia</h1>
          </div>

          {/* Info de usuario + Cerrar sesion */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">
                {usuarioActual?.nombre || 'Usuario'}
              </p>
              <p className="text-xs text-gray-500">
                {usuarioActual?.rol || 'admin'}
              </p>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {(usuarioActual?.nombre || 'U').charAt(0).toUpperCase()}
            </div>

            {/* Boton cerrar sesion */}
            <button
              onClick={handleLogout}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main>
        <Usuarios onLogout={handleLogout} />
      </main>
    </div>
  );
}

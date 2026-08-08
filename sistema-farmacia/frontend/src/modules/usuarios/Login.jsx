import { useState } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export default function Login({ onLoginSuccess }) {
  
  const [isRegistering, setIsRegistering] = useState(false);

  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');

  // ── Estado de UI ──
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' }); // tipo: 'exito' | 'error'

  // ── Limpiar formulario al cambiar de modo ──
  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setEmail('');
    setPassword('');
    setNombre('');
    setConfirmarPassword('');
    setMensaje({ texto: '', tipo: '' });
  };

  // ── Manejar Login ──
  const handleLogin = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!email.trim() || !password.trim()) {
      setMensaje({ texto: 'Por favor completa todos los campos.', tipo: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Credenciales incorrectas.');
      }

      // Guardar token en localStorage
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      if (data.usuario) {
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
      }

      setMensaje({ texto: '¡Inicio de sesión exitoso!', tipo: 'exito' });

      // Notificar al componente padre
      if (onLoginSuccess) {
        setTimeout(() => onLoginSuccess(data), 600);
      }
    } catch (err) {
      setMensaje({ texto: err.message || 'Error al iniciar sesión.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

 
  const handleRegistro = async (e) => {
    e.preventDefault();
    setMensaje({ texto: '', tipo: '' });

    if (!nombre.trim() || !email.trim() || !password.trim() || !confirmarPassword.trim()) {
      setMensaje({ texto: 'Por favor completa todos los campos.', tipo: 'error' });
      return;
    }

    if (password !== confirmarPassword) {
      setMensaje({ texto: 'Las contraseñas no coinciden.', tipo: 'error' });
      return;
    }

    if (password.length < 6) {
      setMensaje({ texto: 'La contraseña debe tener al menos 6 caracteres.', tipo: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al crear la cuenta.');
      }

      setMensaje({ texto: '¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', tipo: 'exito' });

      setTimeout(() => {
        setIsRegistering(false);
        setNombre('');
        setConfirmarPassword('');
        setMensaje({ texto: '', tipo: '' });
      }, 1500);
    } catch (err) {
      setMensaje({ texto: err.message || 'Error al registrarse.', tipo: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* ── Logo / Encabezado ── */}
        <div className="text-center mb-8">
          
          <h1 className="text-2xl font-bold text-gray-800">Sistema de Farmacia</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isRegistering ? 'Crea tu cuenta para acceder al sistema' : 'Ingresa tus credenciales para continuar'}
          </p>
        </div>

        {/* ── Card del formulario ── */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {/* Título del formulario */}
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h2>

          {/* ── Mensaje de alerta ── */}
          {mensaje.texto && (
            <div
              className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                mensaje.tipo === 'exito'
                  ? 'bg-green-100 text-green-700 border border-green-200'
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}
            >
              <div className="flex items-center gap-2">
                {mensaje.tipo === 'exito' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>{mensaje.texto}</span>
              </div>
            </div>
          )}

          {/* ── Formulario ── */}
          <form onSubmit={isRegistering ? handleRegistro : handleLogin} className="space-y-5">
            {/* Campo Nombre (solo en registro) */}
            {isRegistering && (
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. María López"
                  className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Campo Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@farmacia.com"
                className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              />
            </div>

            {/* Campo Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
              />
            </div>

            {/* Campo Confirmar Password (solo en registro) */}
            {isRegistering && (
              <div>
                <label htmlFor="confirmarPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  id="confirmarPassword"
                  name="confirmarPassword"
                  value={confirmarPassword}
                  onChange={(e) => setConfirmarPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors placeholder:text-gray-400"
                />
              </div>
            )}

            {/* Botón principal */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-medium rounded-lg px-4 py-2.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {loading
                ? (isRegistering ? 'Creando cuenta...' : 'Ingresando...')
                : (isRegistering ? 'Crear cuenta' : 'Iniciar sesión')
              }
            </button>
          </form>

          {/* ── Divisor ── */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500">o</span>
            </div>
          </div>

          {/* ── Link para alternar login/registro ── */}
          <div className="text-center">
            <p className="text-sm text-gray-500">
              {isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes una cuenta?'}
              <button
                type="button"
                onClick={toggleMode}
                className="ml-1 text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
              >
                {isRegistering ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </p>
          </div>
        </div>

        {/* ── Footer ── */}
        <p className="text-center text-xs text-gray-400 mt-6">
          © 2026 Sistema de Farmacia
        </p>
      </div>
    </div>
  );
}
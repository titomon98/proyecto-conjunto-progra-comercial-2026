// Componente raíz de la aplicación.
// Gestiona el flujo de autenticación y la navegación entre módulos.

import { useState, useEffect } from 'react';
import Login from './modules/usuarios/Login';
import Usuarios from './modules/usuarios/Usuarios';
import { limpiarSesion, tokenVencido } from './modules/usuarios/sesion';
import { MedicamentosView } from './modules/medicamentos/MedicamentosView';
import { VentasPage } from './modules/ventas';
import { ProveedoresPage } from './modules/proveedores';
import { InventarioView } from './modules/inventario';
import { ClientesView } from './modules/clientes';
import { ReportesPage } from './modules/reportes';

// Modulos con pantalla enlazada en la navegacion. Al integrar un modulo nuevo
// se agrega aqui y se renderiza mas abajo, en el <main>.
const MODULOS = [
  { id: 'medicamentos', texto: 'Medicamentos' },
  { id: 'proveedores', texto: 'Proveedores' },
  { id: 'inventario', texto: 'Inventario' },
  { id: 'clientes', texto: 'Clientes' },
  { id: 'ventas', texto: 'Ventas' },
  { id: 'reportes', texto: 'Reportes' },
  { id: 'usuarios', texto: 'Usuarios' },
];

const MENSAJE_SESION_EXPIRADA = 'Tu sesión expiró. Volvé a iniciar sesión.';

// Cada cuanto se revisa si el token vencio mientras la pestana sigue abierta.
const INTERVALO_CHEQUEO_SESION = 60 * 1000;

// Normaliza el usuario que devuelve el login. El backend al que apunte el
// frontend podria no ser el de este repositorio (otra rama del grupo, otro
// puerto) y devolverlo con otra forma; un objeto donde se espera texto tumba
// React entero con "Objects are not valid as a React child".
// Devuelve null si no sirve, y siempre deja email y rol como texto.
function normalizarUsuario(usuario) {
  if (!usuario || typeof usuario !== 'object' || Array.isArray(usuario)) return null;
  if (typeof usuario.email !== 'string') return null;

  return {
    ...usuario,
    email: usuario.email,
    // Si el rol llega como objeto (por ejemplo si algun dia se normaliza en una
    // tabla roles), se toma su nombre en vez de intentar pintar el objeto.
    rol:
      typeof usuario.rol === 'string'
        ? usuario.rol
        : usuario.rol?.nombre_rol ?? usuario.rol?.nombre ?? 'Sin rol',
  };
}

export default function App() {
  const [token, setToken] = useState(null);
  const [usuarioActual, setUsuarioActual] = useState(null);
  const [moduloActivo, setModuloActivo] = useState('medicamentos'); // Tab activa por defecto
  const [avisoLogin, setAvisoLogin] = useState('');

  // ── Al abrir la app siempre se arranca en el Login ──
  // Antes se restauraba la sesion guardada en localStorage sin revisar si el
  // token seguia vivo. Como dura 8h, al reabrir el navegador entrabas directo a
  // Medicamentos con un token muerto y Usuarios —el unico modulo protegido con
  // verificarToken— respondia 401 sin explicacion: sesion zombi. Se descarta lo
  // guardado y se piden credenciales de nuevo.
  //
  // Efecto: recargar la pagina obliga a volver a entrar. Es a proposito.
  useEffect(() => {
    limpiarSesion();
  }, []);

  // ── Cerrar sesión ──
  // Recibe un aviso opcional para explicar en el Login por que se cerro.
  const cerrarSesion = (aviso) => {
    limpiarSesion();
    setToken(null);
    setUsuarioActual(null);
    setModuloActivo('medicamentos');
    setAvisoLogin(typeof aviso === 'string' ? aviso : '');
  };

  // ── Vigilar el vencimiento del token durante la sesión ──
  // Cubre el caso de dejar la pestana abierta mas de 8h: en vez de quedarse en
  // una pantalla viva contra un backend que ya la rechaza, se cierra sola.
  useEffect(() => {
    if (!token) return;

    const revisar = () => {
      if (tokenVencido(token)) cerrarSesion(MENSAJE_SESION_EXPIRADA);
    };

    revisar();
    const idIntervalo = setInterval(revisar, INTERVALO_CHEQUEO_SESION);
    return () => clearInterval(idIntervalo);
  }, [token]);

  // ── Login exitoso ──
  const handleLoginSuccess = (data) => {
    setAvisoLogin('');
    setToken(data.token);
    setUsuarioActual(normalizarUsuario(data.usuario));
  };

  // ── Sin token: mostrar Login ──
  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} aviso={avisoLogin} />;
  }

  // Se fuerza a texto antes de pintar: si el backend algun dia devuelve el rol
  // como objeto (por ejemplo al normalizarlo en una tabla roles), aqui se
  // degrada en vez de tumbar toda la aplicacion.
  const emailUsuario =
    typeof usuarioActual?.email === 'string' ? usuarioActual.email : 'Usuario';
  const rolUsuario =
    typeof usuarioActual?.rol === 'string' ? usuarioActual.rol : 'Sin rol';

  // ── Con token: mostrar aplicación ──
  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo / Título */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-gray-800">Sistema de Farmacia</h1>
          </div>

          {/* Info de usuario + Cerrar sesión */}
          <div className="flex items-center gap-4">
            {/* La tabla usuarios no tiene columna nombre: se identifica por email. */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{emailUsuario}</p>
              <p className="text-xs text-gray-500">{rolUsuario}</p>
            </div>

            {/* Avatar */}
            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
              {emailUsuario.charAt(0).toUpperCase()}
            </div>

            {/* Botón cerrar sesión */}
            <button
              onClick={() => cerrarSesion()}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 text-sm hover:bg-gray-50 transition-colors flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </div>
        </div>

        {/* ── Navegación de Módulos (Tabs) ── */}
        <div className="max-w-6xl mx-auto px-4 flex gap-4 mt-2 border-t border-gray-100 pt-2">
          {MODULOS.map((m) => (
            <button
              key={m.id}
              onClick={() => setModuloActivo(m.id)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                moduloActivo === m.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {m.texto}
            </button>
          ))}
        </div>
      </header>

      {/* ── Contenido principal ── */}
      <main className="max-w-6xl mx-auto p-4">
        {moduloActivo === 'medicamentos' && <MedicamentosView />}
        {moduloActivo === 'proveedores' && <ProveedoresPage />}
        {moduloActivo === 'inventario' && <InventarioView />}
        {moduloActivo === 'clientes' && <ClientesView />}
        {moduloActivo === 'ventas' && <VentasPage usuario={usuarioActual} />}
        {moduloActivo === 'reportes' && <ReportesPage />}
        {moduloActivo === 'usuarios' && <Usuarios onLogout={cerrarSesion} />}
      </main>
    </div>
  );
}

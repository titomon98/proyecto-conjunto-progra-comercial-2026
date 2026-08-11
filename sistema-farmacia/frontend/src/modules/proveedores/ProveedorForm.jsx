// frontend/src/modules/proveedores/ProveedorForm.jsx
//
// NOTA DE OWNERSHIP: según la Fase 2 del plan, este archivo es responsabilidad
// de C (formulario de crear/editar, en modal). Te lo doy para que tu
// ProveedoresPage.jsx tenga el flujo completo mientras C lo entrega — avísale
// para que lo revise/asuma como suyo antes de la PR final, no lo subas como
// si fuera tuyo.
//
// Reglas del CONTRATO.md §7 aplicadas: fondo blanco, bordes rounded-lg/xl,
// botón primario azul, botón secundario blanco con borde gris.
//
// Valida en el cliente los mismos límites que ya aplica
// proveedores.validator.js en el backend (nombre 2–150, teléfono, email),
// para no depender solo del error 400 del servidor — pero el servidor sigue
// siendo la fuente de verdad: si igual falla allá, se muestran esos errores.

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { crearProveedor, actualizarProveedor } from './proveedores.api';

const CAMPOS_VACIOS = {
  nombre: '',
  contacto: '',
  telefono: '',
  email: '',
  direccion: '',
};

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const RE_TELEFONO = /^\+?[\d][\d\s()-]{6,19}$/;

function validarCliente(valores) {
  const errores = {};

  const nombre = valores.nombre.trim();
  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio';
  } else if (nombre.length < 2 || nombre.length > 150) {
    errores.nombre = 'Debe tener entre 2 y 150 caracteres';
  }

  if (valores.telefono.trim() && !RE_TELEFONO.test(valores.telefono.trim())) {
    errores.telefono = 'Formato inválido (mínimo 8 dígitos)';
  }

  if (valores.email.trim() && !RE_EMAIL.test(valores.email.trim())) {
    errores.email = 'Formato de email inválido';
  }

  return errores;
}

/**
 * @param {object} props
 * @param {object|null} props.proveedor - null = modo crear; objeto = modo editar.
 * @param {() => void} props.onCerrar
 * @param {() => void} props.onGuardado - se llama tras crear/actualizar con éxito.
 */
export default function ProveedorForm({ proveedor, onCerrar, onGuardado }) {
  const esEdicion = Boolean(proveedor);

  const [valores, setValores] = useState(CAMPOS_VACIOS);
  const [erroresCliente, setErroresCliente] = useState({});
  const [erroresServidor, setErroresServidor] = useState({});
  const [mensajeError, setMensajeError] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (proveedor) {
      setValores({
        nombre: proveedor.nombre ?? '',
        contacto: proveedor.contacto ?? '',
        telefono: proveedor.telefono ?? '',
        email: proveedor.email ?? '',
        direccion: proveedor.direccion ?? '',
      });
    } else {
      setValores(CAMPOS_VACIOS);
    }
    setErroresCliente({});
    setErroresServidor({});
    setMensajeError(null);
  }, [proveedor]);

  function actualizarCampo(campo, valor) {
    setValores((prev) => ({ ...prev, [campo]: valor }));
  }

  function construirPayload() {
    // Igual que el validator del backend: string vacío -> no se manda (crear)
    // o se manda como null para limpiar el campo (editar).
    const payload = { nombre: valores.nombre.trim() };
    ['contacto', 'telefono', 'email', 'direccion'].forEach((campo) => {
      const valor = valores[campo].trim();
      if (esEdicion) {
        payload[campo] = valor || null;
      } else if (valor) {
        payload[campo] = valor;
      }
    });
    return payload;
  }

  async function manejarSubmit(e) {
    e.preventDefault();

    const errores = validarCliente(valores);
    setErroresCliente(errores);
    setErroresServidor({});
    setMensajeError(null);
    if (Object.keys(errores).length > 0) return;

    setGuardando(true);
    try {
      const payload = construirPayload();
      if (esEdicion) {
        await actualizarProveedor(proveedor.id_proveedor, payload);
      } else {
        await crearProveedor(payload);
      }
      onGuardado();
    } catch (err) {
      setMensajeError(err.message || 'No se pudo guardar el proveedor');
      // err.errores viene de proveedores.validator.js / errors.js: [{ campo, mensaje }]
      if (Array.isArray(err.errores) && err.errores.length > 0) {
        const porCampo = {};
        err.errores.forEach((e2) => {
          if (e2.campo) porCampo[e2.campo] = e2.mensaje;
        });
        setErroresServidor(porCampo);
      }
    } finally {
      setGuardando(false);
    }
  }

  function mensajeDeCampo(campo) {
    return erroresCliente[campo] || erroresServidor[campo];
  }

  function claseInput(campo) {
    const base =
      'w-full px-3 py-2 border rounded-md text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent';
    return mensajeDeCampo(campo) ? `${base} border-red-400` : `${base} border-gray-300`;
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-sm w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            {esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            className="text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="px-5 py-4 space-y-4">
          {mensajeError && (
            <div className="bg-amber-100 text-amber-700 text-sm rounded-lg px-3 py-2">
              {mensajeError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={valores.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              className={claseInput('nombre')}
              maxLength={150}
            />
            {mensajeDeCampo('nombre') && (
              <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('nombre')}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Contacto</label>
            <input
              type="text"
              value={valores.contacto}
              onChange={(e) => actualizarCampo('contacto', e.target.value)}
              className={claseInput('contacto')}
              maxLength={100}
            />
            {mensajeDeCampo('contacto') && (
              <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('contacto')}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Teléfono</label>
              <input
                type="text"
                value={valores.telefono}
                onChange={(e) => actualizarCampo('telefono', e.target.value)}
                className={claseInput('telefono')}
                maxLength={20}
              />
              {mensajeDeCampo('telefono') && (
                <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('telefono')}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <input
                type="email"
                value={valores.email}
                onChange={(e) => actualizarCampo('email', e.target.value)}
                className={claseInput('email')}
                maxLength={150}
              />
              {mensajeDeCampo('email') && (
                <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('email')}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Dirección</label>
            <textarea
              value={valores.direccion}
              onChange={(e) => actualizarCampo('direccion', e.target.value)}
              className={`${claseInput('direccion')} resize-none`}
              rows={2}
              maxLength={500}
            />
            {mensajeDeCampo('direccion') && (
              <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('direccion')}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
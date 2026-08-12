// frontend/src/modules/proveedores/ProveedorForm.jsx
//
// Modal de crear/editar proveedor.
//
// La tabla proveedores solo tiene nombre y contacto, asi que el formulario pide
// unicamente esos dos campos. Valida en el cliente los mismos limites que aplica
// proveedores.validator.js en el backend, pero el servidor sigue siendo la
// fuente de verdad: si igual falla alla, se muestran sus errores por campo.
//
// Reglas del CONTRATO.md §7 aplicadas: fondo blanco, bordes rounded-lg/xl,
// boton primario azul, boton secundario blanco con borde gris.

import { useEffect, useState } from 'react';
import { crearProveedor, actualizarProveedor } from './proveedores.api';

const CAMPOS_VACIOS = {
  nombre: '',
  contacto: '',
};

function validarCliente(valores) {
  const errores = {};

  const nombre = valores.nombre.trim();
  if (!nombre) {
    errores.nombre = 'El nombre es obligatorio';
  } else if (nombre.length < 2 || nombre.length > 150) {
    errores.nombre = 'Debe tener entre 2 y 150 caracteres';
  }

  if (valores.contacto.trim().length > 100) {
    errores.contacto = 'No puede exceder 100 caracteres';
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
    // Igual que el validator del backend: al crear, un contacto vacío no se
    // manda; al editar, se manda null para limpiarlo.
    const payload = { nombre: valores.nombre.trim() };
    const contacto = valores.contacto.trim();
    if (esEdicion) {
      payload.contacto = contacto || null;
    } else if (contacto) {
      payload.contacto = contacto;
    }
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
      'w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors placeholder:text-gray-400';
    return mensajeDeCampo(campo) ? `${base} border-red-400` : `${base} border-gray-300`;
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {esEdicion ? 'Editar proveedor' : 'Nuevo proveedor'}
          </h2>
          <button
            type="button"
            onClick={onCerrar}
            disabled={guardando}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={manejarSubmit} className="px-6 py-5 space-y-4">
          {mensajeError && (
            <div className="bg-red-100 text-red-700 border border-red-200 rounded-lg px-4 py-3 text-sm">
              {mensajeError}
            </div>
          )}

          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1.5">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              id="nombre"
              type="text"
              value={valores.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
              placeholder="Ej. Laboratorios Roche"
              className={claseInput('nombre')}
              maxLength={150}
              disabled={guardando}
            />
            {mensajeDeCampo('nombre') && (
              <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('nombre')}</p>
            )}
          </div>

          <div>
            <label htmlFor="contacto" className="block text-sm font-medium text-gray-700 mb-1.5">
              Contacto
            </label>
            <input
              id="contacto"
              type="text"
              value={valores.contacto}
              onChange={(e) => actualizarCampo('contacto', e.target.value)}
              placeholder="Ej. ventas@roche.test"
              className={claseInput('contacto')}
              maxLength={100}
              disabled={guardando}
            />
            {mensajeDeCampo('contacto') && (
              <p className="text-xs text-red-600 mt-1">{mensajeDeCampo('contacto')}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onCerrar}
              disabled={guardando}
              className="bg-white border border-gray-300 text-gray-700 rounded-md px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {guardando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear proveedor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

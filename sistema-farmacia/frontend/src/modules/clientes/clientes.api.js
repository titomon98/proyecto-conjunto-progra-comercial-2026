// frontend/src/modules/clientes/clientes.api.js
// Unico lugar del modulo que habla con el backend.
// Base URL configurable con VITE_API_URL en frontend/.env (ver .env.example).

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const RECURSO = `${API_URL}/clientes`;

// El modulo clientes responde sus errores como { mensaje }.
async function solicitar(url, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    throw new Error('No se pudo conectar con el servidor');
  }

  // DELETE responde 204 sin cuerpo.
  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(cuerpo.mensaje || cuerpo.error || `Error ${respuesta.status}`);
  }

  return cuerpo;
}

/** GET /api/clientes */
export const obtenerClientes = () => solicitar(RECURSO);

/** GET /api/clientes/:id */
export const obtenerClientePorId = (id) => solicitar(`${RECURSO}/${id}`);

/** POST /api/clientes */
export const crearCliente = (datos) =>
  solicitar(RECURSO, { method: 'POST', body: JSON.stringify(datos) });

/** PUT /api/clientes/:id */
export const actualizarCliente = (id, datos) =>
  solicitar(`${RECURSO}/${id}`, { method: 'PUT', body: JSON.stringify(datos) });

/**
 * DELETE /api/clientes/:id
 * Devuelve 409 si el cliente ya tiene ventas registradas.
 */
export const eliminarCliente = (id) =>
  solicitar(`${RECURSO}/${id}`, { method: 'DELETE' });

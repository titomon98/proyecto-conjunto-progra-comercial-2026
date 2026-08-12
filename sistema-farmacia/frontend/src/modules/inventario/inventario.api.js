// frontend/src/modules/inventario/inventario.api.js
// Unico lugar del modulo que habla con el backend.
// Base URL configurable con VITE_API_URL en frontend/.env (ver .env.example).

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const RECURSO = `${API_URL}/inventario`;

// El modulo inventario responde sus errores como { mensaje }, a diferencia de
// medicamentos y usuarios que usan { error }. Se contemplan ambos.
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

  if (respuesta.status === 204) return null;

  const cuerpo = await respuesta.json().catch(() => ({}));

  if (!respuesta.ok) {
    throw new Error(cuerpo.mensaje || cuerpo.error || `Error ${respuesta.status}`);
  }

  return cuerpo;
}

/** GET /api/inventario */
export const obtenerInventario = () => solicitar(RECURSO);

/** POST /api/inventario */
export const crearInventario = (datos) =>
  solicitar(RECURSO, { method: 'POST', body: JSON.stringify(datos) });

/**
 * PUT /api/inventario/:id
 * El service del backend exige id_medicamento Y stock_actual en el cuerpo,
 * asi que la pantalla siempre manda los dos aunque solo cambie el stock.
 */
export const actualizarInventario = (id, datos) =>
  solicitar(`${RECURSO}/${id}`, { method: 'PUT', body: JSON.stringify(datos) });

/** DELETE /api/inventario/:id */
export const eliminarInventario = (id) =>
  solicitar(`${RECURSO}/${id}`, { method: 'DELETE' });

/**
 * Catalogo de medicamentos. El inventario guarda id_medicamento, no el nombre,
 * asi que hay que cruzarlo para que la tabla sea legible.
 */
export const obtenerMedicamentos = () => solicitar(`${API_URL}/medicamentos`);

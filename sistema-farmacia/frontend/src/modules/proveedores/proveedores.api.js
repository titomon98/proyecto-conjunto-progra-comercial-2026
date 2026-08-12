// frontend/src/modules/proveedores/proveedores.api.js
//
// Unico lugar del modulo que habla con el backend.
//
// VITE_API_URL ya incluye el prefijo /api, igual que en el resto de los modulos
// y que en frontend/.env.example. Antes este archivo asumia lo contrario y
// terminaba armando /api/api/proveedores en cuanto alguien creaba su .env.
//
// Devuelve siempre datos ya "desempacados", o lanza un Error con .statusCode y
// .errores para que la UI decida que mostrar.

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
const RECURSO = `${API_URL}/proveedores`;

/**
 * Lanza un Error enriquecido a partir de una respuesta { ok:false, ... }
 * para que los componentes puedan mostrar `mensaje` y, si aplica, `errores`
 * campo por campo (los que arma proveedores.validator.js en el backend).
 */
function errorDesdeRespuesta(status, cuerpo) {
  const error = new Error(cuerpo?.mensaje || 'Ocurrió un error inesperado');
  error.statusCode = status;
  error.errores = cuerpo?.errores || [];
  return error;
}

async function solicitar(url, opciones = {}) {
  let respuesta;
  try {
    respuesta = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...opciones,
    });
  } catch {
    // Fallo de red real (servidor caído, sin conexión, CORS, etc.)
    const error = new Error('No se pudo conectar con el servidor');
    error.statusCode = 0;
    error.errores = [];
    throw error;
  }

  const cuerpo = respuesta.status === 204 ? null : await respuesta.json();

  if (!respuesta.ok || cuerpo?.ok === false) {
    throw errorDesdeRespuesta(respuesta.status, cuerpo);
  }

  return cuerpo;
}

/**
 * Lista proveedores paginados.
 * El backend responde { datos: [...], meta: { total, pagina, limite } };
 * aquí se aplana para que el componente reciba una sola forma consistente.
 * @param {{ pagina?: number, limite?: number, busqueda?: string }} filtros
 * @returns {Promise<{ datos: object[], total: number, pagina: number, limite: number }>}
 */
async function listarProveedores({ pagina = 1, limite = 10, busqueda } = {}) {
  const params = new URLSearchParams();
  params.set('pagina', pagina);
  params.set('limite', limite);
  if (busqueda) params.set('busqueda', busqueda);

  const cuerpo = await solicitar(`${RECURSO}?${params.toString()}`);

  return {
    datos: cuerpo.datos ?? [],
    total: cuerpo.meta?.total ?? (cuerpo.datos?.length || 0),
    pagina: cuerpo.meta?.pagina ?? pagina,
    limite: cuerpo.meta?.limite ?? limite,
  };
}

/** @returns {Promise<object>} */
async function obtenerProveedor(id) {
  const cuerpo = await solicitar(`${RECURSO}/${id}`);
  return cuerpo.datos;
}

/** @returns {Promise<object>} */
async function crearProveedor(datos) {
  const cuerpo = await solicitar(RECURSO, { method: 'POST', body: JSON.stringify(datos) });
  return cuerpo.datos;
}

/** @returns {Promise<object>} */
async function actualizarProveedor(id, datos) {
  const cuerpo = await solicitar(`${RECURSO}/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
  return cuerpo.datos;
}

/**
 * Borrado fisico. El backend responde 409 si el proveedor tiene medicamentos
 * asociados; ese mensaje llega en error.message.
 */
async function eliminarProveedor(id) {
  await solicitar(`${RECURSO}/${id}`, { method: 'DELETE' });
}

export {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
};

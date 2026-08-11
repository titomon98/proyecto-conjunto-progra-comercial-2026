// frontend/src/modules/proveedores/proveedores.api.js
//
// NOTA DE OWNERSHIP: según la Fase 2 del plan, este archivo es responsabilidad
// de A (`proveedores.api.js` — capa de llamadas HTTP). Te lo doy aquí para que
// puedas levantar y probar tu ProveedoresPage.jsx ya mismo, pero avísale a A
// para que lo revise/asuma como suyo antes de la PR final — no lo subas como
// si fuera tuyo.
//
// Envuelve fetch() contra los endpoints reales del módulo Proveedores y
// devuelve siempre datos ya "desempacados" (o lanza un Error con .statusCode
// y .errores para que la UI decida qué mostrar).

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const RECURSO = `${API_BASE_URL}/api/proveedores`;

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
  } catch (redError) {
    // Fallo de red real (servidor caído, sin conexión, CORS, etc.)
    const error = new Error('No se pudo conectar con el servidor');
    error.statusCode = 0;
    error.errores = [];
    throw error;
  }

  // 204 / DELETE sin cuerpo (por si acaso; hoy el backend siempre responde JSON)
  const cuerpo = respuesta.status === 204 ? null : await respuesta.json();

  if (!respuesta.ok || cuerpo?.ok === false) {
    throw errorDesdeRespuesta(respuesta.status, cuerpo);
  }

  return cuerpo.datos;
}

/**
 * Lista proveedores.
 * @param {{ pagina?: number, limite?: number, busqueda?: string, activo?: boolean|'todos' }} filtros
 * @returns {Promise<{ datos: object[], total: number, pagina: number, limite: number }>}
 *
 * OJO: el backend responde { datos: [...], meta: { total, pagina, limite } },
 * no { datos, total, pagina, limite } todo junto. Aquí lo aplanamos para que
 * el componente reciba una sola forma consistente.
 */
async function listarProveedores({ pagina = 1, limite = 10, busqueda, activo } = {}) {
  const params = new URLSearchParams();
  params.set('pagina', pagina);
  params.set('limite', limite);
  if (busqueda) params.set('busqueda', busqueda);
  if (activo !== undefined) params.set('activo', activo);

  let respuesta;
  try {
    respuesta = await fetch(`${RECURSO}?${params.toString()}`);
  } catch {
    const error = new Error('No se pudo conectar con el servidor');
    error.statusCode = 0;
    error.errores = [];
    throw error;
  }

  const cuerpo = await respuesta.json();
  if (!respuesta.ok || cuerpo?.ok === false) {
    throw errorDesdeRespuesta(respuesta.status, cuerpo);
  }

  return {
    datos: cuerpo.datos,
    total: cuerpo.meta?.total ?? cuerpo.datos.length,
    pagina: cuerpo.meta?.pagina ?? pagina,
    limite: cuerpo.meta?.limite ?? limite,
  };
}

/** @returns {Promise<object>} */
function obtenerProveedor(id) {
  return solicitar(`${RECURSO}/${id}`);
}

/** @returns {Promise<object>} */
function crearProveedor(datos) {
  return solicitar(RECURSO, { method: 'POST', body: JSON.stringify(datos) });
}

/** @returns {Promise<object>} */
function actualizarProveedor(id, datos) {
  return solicitar(`${RECURSO}/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
}

/** Borrado lógico. @returns {Promise<null>} */
function desactivarProveedor(id) {
  return solicitar(`${RECURSO}/${id}`, { method: 'DELETE' });
}

export {
  listarProveedores,
  obtenerProveedor,
  crearProveedor,
  actualizarProveedor,
  desactivarProveedor,
};
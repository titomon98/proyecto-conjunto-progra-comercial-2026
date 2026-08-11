'use strict';

/**
 * proveedores.validator.js
 * Dueño: Integrante D (Validación, Errores y Calidad)
 *
 * Validación NATIVA en JavaScript. Sin Zod, Joi ni express-validator, porque
 * agregar una dependencia modifica backend/package.json, que es archivo
 * compartido entre los 7 equipos.
 *
 * Cada validador es un middleware de Express que:
 *   - acumula TODOS los errores encontrados (no corta en el primero),
 *   - sanitiza y normaliza los valores,
 *   - deja el resultado limpio en req.datosValidados / req.consultaValidada,
 *   - o llama next(new ValidationError(...)) con el detalle.
 *
 * Importante: NO escribimos sobre req.query. En Express 5 req.query es un getter
 * de solo lectura, así que el resultado del listado va en req.consultaValidada.
 */

const { ValidationError } = require('./proveedores.errors');

// ---------------------------------------------------------------------------
// Constantes del contrato
// ---------------------------------------------------------------------------

const LIMITES = {
  nombre: { min: 2, max: 150 },
  contacto: { max: 100 },
  telefono: { min: 8, max: 20 },
  email: { max: 150 },
  direccion: { max: 500 },
  busqueda: { max: 100 },
  paginaDefault: 1,
  limiteDefault: 10,
  limiteMaximo: 100,
};

const CAMPOS_PERMITIDOS = ['nombre', 'contacto', 'telefono', 'email', 'direccion'];

const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
const RE_TELEFONO = /^\+?[\d][\d\s()-]{6,19}$/;

// ---------------------------------------------------------------------------
// Utilidades internas
// ---------------------------------------------------------------------------

/** Quita caracteres de control, colapsa espacios y recorta. */
function sanitizarTexto(valor) {
  if (typeof valor !== 'string') return valor;
  // eslint-disable-next-line no-control-regex
  return valor.replace(/[\u0000-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim();
}

function esVacio(valor) {
  return valor === undefined || valor === null || (typeof valor === 'string' && valor.trim() === '');
}

/** Acumulador de errores con forma { campo, mensaje }. */
function crearColector() {
  const errores = [];
  return {
    agregar(campo, mensaje) {
      errores.push({ campo, mensaje });
    },
    get lista() {
      return errores;
    },
    get hayErrores() {
      return errores.length > 0;
    },
  };
}

/** El body debe ser un objeto plano; ni array, ni string, ni null. */
function bodyEsObjeto(body) {
  return body !== null && typeof body === 'object' && !Array.isArray(body);
}

// ---------------------------------------------------------------------------
// Validaciones de campo reutilizables
// ---------------------------------------------------------------------------

function validarNombre(valor, col, { obligatorio }) {
  if (esVacio(valor)) {
    if (obligatorio) col.agregar('nombre', 'El nombre es obligatorio');
    return undefined;
  }
  if (typeof valor !== 'string') {
    col.agregar('nombre', 'El nombre debe ser texto');
    return undefined;
  }
  const limpio = sanitizarTexto(valor);
  if (limpio.length < LIMITES.nombre.min || limpio.length > LIMITES.nombre.max) {
    col.agregar('nombre', `El nombre debe tener entre ${LIMITES.nombre.min} y ${LIMITES.nombre.max} caracteres`);
    return undefined;
  }
  return limpio;
}

function validarContacto(valor, col) {
  if (esVacio(valor)) return null; // opcional: null explícito para limpiar el campo
  if (typeof valor !== 'string') {
    col.agregar('contacto', 'El contacto debe ser texto');
    return undefined;
  }
  const limpio = sanitizarTexto(valor);
  if (limpio.length > LIMITES.contacto.max) {
    col.agregar('contacto', `El contacto no puede exceder ${LIMITES.contacto.max} caracteres`);
    return undefined;
  }
  return limpio;
}

function validarTelefono(valor, col) {
  if (esVacio(valor)) return null;
  if (typeof valor !== 'string' && typeof valor !== 'number') {
    col.agregar('telefono', 'El teléfono debe ser texto');
    return undefined;
  }
  const limpio = sanitizarTexto(String(valor));
  if (limpio.length > LIMITES.telefono.max) {
    col.agregar('telefono', `El teléfono no puede exceder ${LIMITES.telefono.max} caracteres`);
    return undefined;
  }
  if (!RE_TELEFONO.test(limpio)) {
    col.agregar('telefono', 'El teléfono solo admite dígitos, espacios, guiones, paréntesis y un + inicial (mínimo 8 dígitos)');
    return undefined;
  }
  return limpio;
}

function validarEmail(valor, col) {
  if (esVacio(valor)) return null;
  if (typeof valor !== 'string') {
    col.agregar('email', 'El email debe ser texto');
    return undefined;
  }
  const limpio = sanitizarTexto(valor).toLowerCase();
  if (limpio.length > LIMITES.email.max) {
    col.agregar('email', `El email no puede exceder ${LIMITES.email.max} caracteres`);
    return undefined;
  }
  if (!RE_EMAIL.test(limpio)) {
    col.agregar('email', 'El formato del email no es válido');
    return undefined;
  }
  return limpio;
}

function validarDireccion(valor, col) {
  if (esVacio(valor)) return null;
  if (typeof valor !== 'string') {
    col.agregar('direccion', 'La dirección debe ser texto');
    return undefined;
  }
  const limpio = sanitizarTexto(valor);
  if (limpio.length > LIMITES.direccion.max) {
    col.agregar('direccion', `La dirección no puede exceder ${LIMITES.direccion.max} caracteres`);
    return undefined;
  }
  return limpio;
}

/** Rechaza campos que el cliente no tiene permitido enviar (activo, id, timestamps...). */
function rechazarCamposNoPermitidos(body, col) {
  Object.keys(body).forEach((campo) => {
    if (!CAMPOS_PERMITIDOS.includes(campo)) {
      col.agregar(campo, `El campo "${campo}" no está permitido en esta operación`);
    }
  });
}

// ---------------------------------------------------------------------------
// Middlewares por endpoint
// ---------------------------------------------------------------------------

/**
 * POST /api/proveedores
 * nombre obligatorio; el resto opcional. Resultado en req.datosValidados.
 */
function validarCrear(req, res, next) {
  const col = crearColector();

  if (!bodyEsObjeto(req.body)) {
    return next(new ValidationError('El cuerpo de la petición debe ser un objeto JSON', []));
  }

  rechazarCamposNoPermitidos(req.body, col);

  const datos = {
    nombre: validarNombre(req.body.nombre, col, { obligatorio: true }),
    contacto: validarContacto(req.body.contacto, col),
    telefono: validarTelefono(req.body.telefono, col),
    email: validarEmail(req.body.email, col),
    direccion: validarDireccion(req.body.direccion, col),
  };

  if (col.hayErrores) {
    return next(new ValidationError('No se pudo crear el proveedor: hay campos inválidos', col.lista));
  }

  req.datosValidados = datos;
  return next();
}

/**
 * PUT /api/proveedores/:id
 * Requiere al menos un campo actualizable. Enviar null limpia el campo opcional.
 */
function validarActualizar(req, res, next) {
  const col = crearColector();

  if (!bodyEsObjeto(req.body)) {
    return next(new ValidationError('El cuerpo de la petición debe ser un objeto JSON', []));
  }

  rechazarCamposNoPermitidos(req.body, col);

  const presentes = CAMPOS_PERMITIDOS.filter((c) => Object.prototype.hasOwnProperty.call(req.body, c));
  if (presentes.length === 0) {
    col.agregar('body', `Debe enviar al menos uno de estos campos: ${CAMPOS_PERMITIDOS.join(', ')}`);
  }

  const datos = {};

  if (presentes.includes('nombre')) {
    const v = validarNombre(req.body.nombre, col, { obligatorio: true });
    if (v !== undefined) datos.nombre = v;
  }
  if (presentes.includes('contacto')) {
    const v = validarContacto(req.body.contacto, col);
    if (v !== undefined) datos.contacto = v;
  }
  if (presentes.includes('telefono')) {
    const v = validarTelefono(req.body.telefono, col);
    if (v !== undefined) datos.telefono = v;
  }
  if (presentes.includes('email')) {
    const v = validarEmail(req.body.email, col);
    if (v !== undefined) datos.email = v;
  }
  if (presentes.includes('direccion')) {
    const v = validarDireccion(req.body.direccion, col);
    if (v !== undefined) datos.direccion = v;
  }

  if (col.hayErrores) {
    return next(new ValidationError('No se pudo actualizar el proveedor: hay campos inválidos', col.lista));
  }

  req.datosValidados = datos;
  return next();
}

/**
 * GET /api/proveedores
 * Normaliza paginación y filtros. Resultado en req.consultaValidada.
 * Decisión: si no se envía "activo", por defecto se listan SOLO los activos,
 * porque la desactivación es nuestro equivalente al borrado.
 */
function validarListar(req, res, next) {
  const col = crearColector();
  const q = req.query || {};

  // pagina
  let pagina = LIMITES.paginaDefault;
  if (!esVacio(q.pagina)) {
    const n = Number(q.pagina);
    if (!Number.isInteger(n) || n < 1) {
      col.agregar('pagina', 'La página debe ser un entero mayor o igual a 1');
    } else {
      pagina = n;
    }
  }

  // limite
  let limite = LIMITES.limiteDefault;
  if (!esVacio(q.limite)) {
    const n = Number(q.limite);
    if (!Number.isInteger(n) || n < 1) {
      col.agregar('limite', 'El límite debe ser un entero mayor o igual a 1');
    } else {
      limite = Math.min(n, LIMITES.limiteMaximo); // tope duro: protege la BD compartida
    }
  }

  // busqueda
  let busqueda = null;
  if (!esVacio(q.busqueda)) {
    if (typeof q.busqueda !== 'string') {
      col.agregar('busqueda', 'La búsqueda debe ser texto');
    } else {
      const limpio = sanitizarTexto(q.busqueda);
      if (limpio.length > LIMITES.busqueda.max) {
        col.agregar('busqueda', `La búsqueda no puede exceder ${LIMITES.busqueda.max} caracteres`);
      } else {
        // Se escapan los comodines de LIKE/ILIKE para que no alteren el filtro.
        busqueda = limpio.replace(/[%_]/g, (m) => `\\${m}`);
      }
    }
  }

  // activo
  let activo = true;
  if (!esVacio(q.activo)) {
    const v = String(q.activo).toLowerCase();
    if (['true', '1', 'si', 'sí'].includes(v)) activo = true;
    else if (['false', '0', 'no'].includes(v)) activo = false;
    else if (['todos', 'all'].includes(v)) activo = null; // null = sin filtro
    else col.agregar('activo', 'El parámetro activo admite: true, false o todos');
  }

  if (col.hayErrores) {
    return next(new ValidationError('Parámetros de consulta inválidos', col.lista));
  }

  req.consultaValidada = { pagina, limite, busqueda, activo };
  return next();
}

/** Valida que :id sea un UUID válido. Sirve para GET/:id, PUT/:id y DELETE/:id. */
function validarIdParam(req, res, next) {
  const id = req.params && req.params.id;
  if (esVacio(id) || !RE_UUID.test(String(id).trim())) {
    return next(
      new ValidationError('El identificador del proveedor no es válido', [
        { campo: 'id', mensaje: 'Debe ser un UUID válido' },
      ])
    );
  }
  req.idValidado = String(id).trim().toLowerCase();
  return next();
}

module.exports = {
  validarCrear,
  validarActualizar,
  validarListar,
  validarIdParam,
  // expuestos para pruebas y reutilización interna del equipo
  LIMITES,
  CAMPOS_PERMITIDOS,
  sanitizarTexto,
  RE_UUID,
  RE_EMAIL,
  RE_TELEFONO,
};
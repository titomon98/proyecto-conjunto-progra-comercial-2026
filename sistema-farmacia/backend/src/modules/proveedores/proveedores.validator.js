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
 * ALCANCE: la tabla proveedores solo tiene nombre y contacto como campos
 * editables (ver proveedores.model.js). No se validan telefono, email,
 * direccion ni activo porque esas columnas no existen en la base.
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
  busqueda: { max: 100 },
  paginaDefault: 1,
  limiteDefault: 10,
  limiteMaximo: 100,
};

const CAMPOS_PERMITIDOS = ['nombre', 'contacto'];

// Formato 8-4-4-4-12 sin exigir version ni variante RFC 4122: los UUID
// sembrados en la base (c1111111-1111-1111-1111-111111111111) son validos como
// identificadores aunque no cumplan el estandar al pie de la letra, y con la
// expresion estricta anterior NINGUN proveedor existente era alcanzable.
const RE_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

/** Rechaza campos que el cliente no tiene permitido enviar (id, timestamps...). */
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

  if (col.hayErrores) {
    return next(new ValidationError('No se pudo actualizar el proveedor: hay campos inválidos', col.lista));
  }

  req.datosValidados = datos;
  return next();
}

/**
 * GET /api/proveedores
 * Normaliza paginación y búsqueda. Resultado en req.consultaValidada.
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
        // Los comodines de LIKE/ILIKE los escapa el model, que es quien arma la
        // consulta. Escaparlos aqui tambien duplicaria las barras invertidas.
        busqueda = limpio;
      }
    }
  }

  if (col.hayErrores) {
    return next(new ValidationError('Parámetros de consulta inválidos', col.lista));
  }

  req.consultaValidada = { pagina, limite, busqueda };
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
};
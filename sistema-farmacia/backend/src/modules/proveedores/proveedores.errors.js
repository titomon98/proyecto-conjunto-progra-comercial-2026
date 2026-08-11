'use strict';

/**
 * proveedores.errors.js
 * Dueño: Integrante D (Validación, Errores y Calidad)
 *
 * Define:
 *   1. Las clases de error de dominio que lanzan el service y el validator.
 *   2. Los helpers de respuesta estándar del equipo.
 *   3. El manejador de errores del MÓDULO (se monta sobre nuestro propio router,
 *      NO en backend/src/middlewares/, que es archivo compartido entre los 7 equipos).
 *
 * Regla: el service lanza errores de DOMINIO (no conoce HTTP).
 *        Este archivo es el único que traduce dominio -> HTTP.
 */

// ---------------------------------------------------------------------------
// 1. Clases de error de dominio
// ---------------------------------------------------------------------------

/**
 * Error base del módulo. Todo error "esperado" hereda de aquí.
 * La bandera esOperacional distingue un error previsto (404, 409, 400) de un
 * bug real (TypeError, fallo de red), que siempre se degrada a 500 genérico.
 */
class AppError extends Error {
  constructor(mensaje, statusCode = 500, { codigo = 'ERROR_INTERNO', errores = [] } = {}) {
    super(mensaje);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.codigo = codigo;
    this.errores = errores;
    this.esOperacional = true;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

/** 400 — la petición no cumple el contrato de entrada. */
class ValidationError extends AppError {
  constructor(mensaje = 'Los datos enviados no son válidos', errores = []) {
    super(mensaje, 400, { codigo: 'VALIDACION', errores });
  }
}

/** 404 — el recurso solicitado no existe (o está desactivado, según el caso). */
class NotFoundError extends AppError {
  constructor(mensaje = 'El recurso solicitado no existe') {
    super(mensaje, 404, { codigo: 'NO_ENCONTRADO' });
  }
}

/** 409 — choque con el estado actual: duplicados, reglas de unicidad. */
class ConflictError extends AppError {
  constructor(mensaje = 'El recurso entra en conflicto con uno existente', errores = []) {
    super(mensaje, 409, { codigo: 'CONFLICTO', errores });
  }
}

/** 400 genérico para peticiones mal formadas que no son de validación de campos. */
class BadRequestError extends AppError {
  constructor(mensaje = 'Petición mal formada', errores = []) {
    super(mensaje, 400, { codigo: 'PETICION_INVALIDA', errores });
  }
}

// ---------------------------------------------------------------------------
// 2. Helpers de respuesta estándar
// ---------------------------------------------------------------------------

/**
 * Respuesta de éxito.
 *   { ok: true, mensaje: "...", datos: {...} }
 * `meta` es opcional y se usa en los listados paginados:
 *   { ok: true, mensaje: "...", datos: [...], meta: { total, pagina, limite } }
 */
function exito(res, { status = 200, mensaje = 'Operación realizada correctamente', datos = null, meta = null }) {
  const cuerpo = { ok: true, mensaje, datos };
  if (meta) cuerpo.meta = meta;
  return res.status(status).json(cuerpo);
}

/** Atajo para 201. */
function creado(res, { mensaje = 'Recurso creado correctamente', datos = null }) {
  return exito(res, { status: 201, mensaje, datos });
}

/**
 * Envuelve un handler async para que cualquier rechazo de promesa llegue a
 * next(error) sin escribir try/catch en cada controller.
 *
 *   router.post('/', envolver(controller.crear));
 */
function envolver(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// ---------------------------------------------------------------------------
// 3. Traducción de errores de PostgreSQL / Supabase
// ---------------------------------------------------------------------------

/**
 * Supabase devuelve códigos SQLSTATE de PostgreSQL. Los traducimos a errores de
 * dominio para no filtrar detalles internos de la base al cliente.
 */
const CODIGOS_POSTGRES = {
  '23505': () => new ConflictError('Ya existe un registro con esos datos'),
  '23503': () => new ConflictError('El registro está referenciado por otro módulo'),
  '23502': () => new ValidationError('Falta un campo obligatorio'),
  '22P02': () => new ValidationError('El formato de uno de los valores es inválido'),
  '22001': () => new ValidationError('Uno de los valores excede la longitud permitida'),
};

function normalizarError(err) {
  if (err instanceof AppError) return err;

  if (err && typeof err.code === 'string' && CODIGOS_POSTGRES[err.code]) {
    return CODIGOS_POSTGRES[err.code]();
  }

  // JSON mal formado en el body (lo lanza express.json()).
  if (err && err.type === 'entity.parse.failed') {
    return new BadRequestError('El cuerpo de la petición no es un JSON válido');
  }

  return null; // error no controlado -> 500 genérico
}

// ---------------------------------------------------------------------------
// 4. Middlewares de error del módulo
// ---------------------------------------------------------------------------

/** 404 para rutas inexistentes DENTRO de /api/proveedores. */
function rutaNoEncontrada(req, res, next) {
  next(new NotFoundError(`La ruta ${req.method} ${req.originalUrl} no existe en el módulo de proveedores`));
}

/**
 * Manejador de errores del módulo. Se monta AL FINAL de proveedores.routes.js.
 * Nunca expone stack traces ni mensajes crudos de Supabase al cliente.
 */
function manejadorErrores(err, req, res, next) {
  if (res.headersSent) return next(err);

  const conocido = normalizarError(err);

  if (!conocido) {
    // Bug real: se registra completo en el servidor, se oculta al cliente.
    console.error('[proveedores] Error no controlado:', {
      ruta: `${req.method} ${req.originalUrl}`,
      mensaje: err && err.message,
      stack: err && err.stack,
    });
    return res.status(500).json({
      ok: false,
      mensaje: 'Ocurrió un error interno en el módulo de proveedores',
      errores: [],
    });
  }

  if (conocido.statusCode >= 500) {
    console.error('[proveedores]', conocido.codigo, conocido.message);
  } else {
    console.warn('[proveedores]', conocido.codigo, conocido.message);
  }

  return res.status(conocido.statusCode).json({
    ok: false,
    mensaje: conocido.message,
    errores: conocido.errores || [],
  });
}

module.exports = {
  // errores de dominio
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  BadRequestError,
  // respuestas
  exito,
  creado,
  envolver,
  // middlewares
  rutaNoEncontrada,
  manejadorErrores,
};
'use strict';

/**
 * proveedores.service.js — LÓGICA DE NEGOCIO
 * ---------------------------------------------------------------------------
 * Dueño original: Integrante C. Ajustes de integración: Integrante D.
 *
 * REGLAS DE ESTA CAPA (README del repo):
 *   - No conoce Express: nada de req ni res en este archivo.
 *   - Solo llama al model (la siguiente capa), nunca al controller.
 *   - Lanza errores de DOMINIO (NotFoundError, ConflictError).
 *     La traducción a códigos HTTP la hace proveedores.errors.js.
 *
 * FIRMAS CONGELADAS: el controller y otros equipos ya dependen de estos
 * nombres. No renombrar sin avisar al equipo completo.
 */

const model = require('./proveedores.model');
const { NotFoundError, ConflictError } = require('./proveedores.errors');

/**
 * Crea un proveedor.
 * Regla de negocio: no puede haber dos proveedores ACTIVOS con el mismo nombre.
 * @param {object} dto - Datos ya validados y sanitizados por el validator.
 * @returns {Promise<object>}
 * @throws {ConflictError} 409 si el nombre ya está tomado por un activo.
 */
async function crearProveedor(dto) {
  const duplicado = await model.existePorNombre(dto.nombre);
  if (duplicado) {
    throw new ConflictError('Ya existe un proveedor activo con ese nombre');
  }
  return model.crear(dto);
}

/**
 * Lista proveedores con paginación.
 * El model devuelve { datos, total }; aquí se le agregan pagina y limite
 * porque el controller los necesita para armar el bloque meta.
 * @param {object} [query] - Ya normalizado por validarListar.
 * @returns {Promise<{ datos: object[], total: number, pagina: number, limite: number }>}
 */
async function listarProveedores(query = {}) {
  const {
    pagina = 1,
    limite = 10,
    busqueda = null,
    activo = true, // null = activos e inactivos
  } = query;

  const { datos, total } = await model.obtenerTodos({ pagina, limite, busqueda, activo });

  return { datos, total, pagina, limite };
}

/**
 * Obtiene un proveedor por su id.
 * @param {string} id - UUID ya validado.
 * @returns {Promise<object>}
 * @throws {NotFoundError} 404 si no existe.
 */
async function obtenerProveedor(id) {
  const proveedor = await model.obtenerPorId(id);
  if (!proveedor) {
    throw new NotFoundError('El proveedor no existe');
  }
  return proveedor;
}

/**
 * Actualiza un proveedor.
 * Si cambia el nombre, se revalida la unicidad excluyendo el propio registro
 * (si no, actualizar un proveedor sin tocar el nombre chocaría consigo mismo).
 * @param {string} id - UUID ya validado.
 * @param {object} dto - Solo los campos a modificar.
 * @returns {Promise<object>}
 * @throws {NotFoundError} 404 · {ConflictError} 409
 */
async function actualizarProveedor(id, dto) {
  const existente = await model.obtenerPorId(id);
  if (!existente) {
    throw new NotFoundError('El proveedor no existe');
  }

  if (dto.nombre) {
    const duplicado = await model.existePorNombre(dto.nombre, id);
    if (duplicado) {
      throw new ConflictError('Ya existe otro proveedor activo con ese nombre');
    }
  }

  const actualizado = await model.actualizar(id, dto);
  if (!actualizado) {
    // Carrera improbable: alguien lo borró entre la lectura y la escritura.
    throw new NotFoundError('El proveedor no existe');
  }
  return actualizado;
}

/**
 * Desactiva un proveedor. Borrado LÓGICO (activo = false), nunca físico:
 * Medicamentos tiene una FK id_proveedor hacia nuestra tabla.
 * @param {string} id - UUID ya validado.
 * @returns {Promise<void>}
 * @throws {NotFoundError} 404 si el id no existe.
 */
async function desactivarProveedor(id) {
  const desactivado = await model.desactivar(id);
  if (!desactivado) {
    throw new NotFoundError('El proveedor no existe');
  }
}

module.exports = {
  crearProveedor,
  listarProveedores,
  obtenerProveedor,
  actualizarProveedor,
  desactivarProveedor,
};
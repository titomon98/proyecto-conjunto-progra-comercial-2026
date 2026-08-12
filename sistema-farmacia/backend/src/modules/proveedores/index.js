'use strict';

/**
 * index.js — ÚNICO PUNTO PÚBLICO DEL MÓDULO PROVEEDORES
 * ---------------------------------------------------------------------------
 * Dueño original: Integrante C. Ajustes de integración: Integrante D.
 *
 * Los otros 6 equipos consumen SOLO lo que se exporta aquí. Nadie importa
 * nuestro service ni nuestro model directamente (regla del README).
 *
 * Todo lo que se expone aquí es de SOLO LECTURA: ningún módulo externo crea,
 * actualiza ni elimina proveedores. Eso pasa únicamente por nuestros endpoints.
 */

const router = require('./proveedores.routes');
const service = require('./proveedores.service');
const { NotFoundError } = require('./proveedores.errors');

/**
 * Obtiene un proveedor por id.
 * Devuelve null si no existe, en vez de lanzar: los otros módulos esperan un
 * valor con el cual decidir, no una excepción. Cualquier OTRO error (fallo de
 * base, bug) sí se propaga, para no ocultar problemas reales detrás de un null.
 * @param {string} id - UUID.
 * @returns {Promise<object|null>}
 */
async function obtenerProveedorPorId(id) {
  try {
    return await service.obtenerProveedor(id);
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
}

/**
 * Indica si un proveedor existe. Pensado para que Medicamentos valide su FK
 * id_proveedor antes de insertar.
 * @param {string} id - UUID.
 * @returns {Promise<boolean>}
 */
async function existeProveedor(id) {
  const proveedor = await obtenerProveedorPorId(id);
  return proveedor !== null;
}

/**
 * Devuelve todos los proveedores, sin paginar.
 * Pensado para poblar selects y catálogos en otros módulos.
 * El límite alto es intencional: un catálogo de proveedores de farmacia no
 * llega a esos números. Si algún día lo hace, hay que paginar aquí.
 * @returns {Promise<object[]>}
 */
async function listarTodos() {
  const { datos } = await service.listarProveedores({ pagina: 1, limite: 1000 });
  return datos;
}

module.exports = {
  router,
  obtenerProveedorPorId,
  existeProveedor,
  listarTodos,
};

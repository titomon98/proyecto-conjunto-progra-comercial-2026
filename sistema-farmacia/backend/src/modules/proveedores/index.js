'use strict';

/**
 * index.js — ÚNICO PUNTO PÚBLICO DEL MÓDULO PROVEEDORES
 * ---------------------------------------------------------------------------
 * Dueño original: Integrante C. Ajustes de integración: Integrante D.
 *
 * Los otros 6 equipos consumen SOLO lo que se exporta aquí. Nadie importa
 * nuestro service ni nuestro model directamente (regla del README).
 *
 * Los nombres de abajo son los del contrato acordado con el grupo. Renombrarlos
 * rompe al módulo de Medicamentos, que usa existeProveedor para validar su FK.
 *
 * Todo lo que se expone aquí es de SOLO LECTURA: ningún módulo externo crea,
 * actualiza ni desactiva proveedores. Eso pasa únicamente por nuestros endpoints.
 */

const proveedoresRouter = require('./proveedores.routes');
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
 * Indica si un proveedor existe. Lo usa Medicamentos para validar su FK
 * id_proveedor antes de insertar.
 * @param {string} id - UUID.
 * @returns {Promise<boolean>}
 */
async function existeProveedor(id) {
  const proveedor = await obtenerProveedorPorId(id);
  return proveedor !== null;
}

/**
 * Devuelve todos los proveedores activos, sin paginar.
 * Pensado para poblar selects y catálogos en otros módulos.
 * El límite alto es intencional: un catálogo de proveedores de farmacia no
 * llega a esos números. Si algún día lo hace, hay que paginar aquí.
 * @returns {Promise<object[]>}
 */
async function listarProveedoresActivos() {
  const { datos } = await service.listarProveedores({
    pagina: 1,
    limite: 1000,
    activo: true,
  });
  return datos;
}

module.exports = {
  proveedoresRouter,
  obtenerProveedorPorId,
  existeProveedor,
  listarProveedoresActivos,

  // Alias temporal: algún equipo pudo haber escrito `.router` leyendo el
  // esqueleto. Se puede quitar cuando se confirme que nadie lo usa.
  router: proveedoresRouter,
};
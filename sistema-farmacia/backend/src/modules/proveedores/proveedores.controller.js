'use strict';

/**
 * proveedores.controller.js — CAPA HTTP
 *
 * Dueña original: Integrante B.
 * Ajustes de integración: Integrante D.
 *
 * REGLA INVIOLABLE DEL README:
 * "El controller nunca habla con el model."
 *
 * Aquí solo se llama al service y se traduce el resultado a HTTP.
 *
 * Los datos ya vienen validados y normalizados por proveedores.validator.js:
 *
 * req.datosValidados   ← body de POST / PUT
 * req.consultaValidada ← query params de GET /
 * req.idValidado       ← :id (UUID en minúsculas)
 *
 * Nunca se lee req.body ni req.query crudos después de la validación.
 *
 * No hay try/catch:
 * envolver() manda cualquier rechazo a next(error), y de ahí al
 * manejadorErrores del módulo, que es el único que decide los códigos HTTP.
 */

const service = require('./proveedores.service');

const {
  exito,
  creado,
  envolver,
} = require('./proveedores.errors');

/**
 * POST /api/proveedores
 */
const crear = envolver(async (req, res) => {
  const proveedor = await service.crearProveedor(req.datosValidados);

  return creado(res, {
    mensaje: 'Proveedor creado correctamente',
    datos: proveedor,
  });
});

/**
 * GET /api/proveedores?pagina=&limite=&busqueda=
 */
const listar = envolver(async (req, res) => {
  const {
    datos,
    total,
    pagina,
    limite,
  } = await service.listarProveedores(req.consultaValidada);

  return exito(res, {
    mensaje: 'Proveedores obtenidos correctamente',
    datos,
    meta: {
      total,
      pagina,
      limite,
    },
  });
});

/**
 * GET /api/proveedores/:id
 */
const obtenerPorId = envolver(async (req, res) => {
  const proveedor = await service.obtenerProveedor(req.idValidado);

  return exito(res, {
    mensaje: 'Proveedor obtenido correctamente',
    datos: proveedor,
  });
});

/**
 * PUT /api/proveedores/:id
 */
const actualizar = envolver(async (req, res) => {
  const proveedor = await service.actualizarProveedor(
    req.idValidado,
    req.datosValidados
  );

  return exito(res, {
    mensaje: 'Proveedor actualizado correctamente',
    datos: proveedor,
  });
});

/**
 * DELETE /api/proveedores/:id — borrado FÍSICO
 * La tabla no tiene columna `activo`, así que no hay borrado lógico. Si el
 * proveedor tiene medicamentos asociados, el service responde 409.
 */
const eliminar = envolver(async (req, res) => {
  await service.eliminarProveedor(req.idValidado);

  return exito(res, {
    mensaje: 'Proveedor eliminado correctamente',
    datos: null,
  });
});

module.exports = {
  crear,
  listar,
  obtenerPorId,
  actualizar,
  eliminar,
};
'use strict';

/**
 * proveedores.routes.js — DEFINICIÓN DE ENDPOINTS
 *
 * Dueña original: Integrante B.
 * Ajustes de integración: Integrante D.
 *
 * REGLA DEL README:
 * Esta capa solo llama al controller. No importa el service ni el model.
 *
 * ORDEN DE CADA RUTA:
 * validador(es) → controller
 *
 * Los middlewares de error van AL FINAL:
 * 1. rutaNoEncontrada → 404 para rutas inexistentes dentro de /api/proveedores
 * 2. manejadorErrores → traduce errores de dominio a HTTP
 */

const express = require('express');

const controller = require('./proveedores.controller');
const validator = require('./proveedores.validator');
const {
  rutaNoEncontrada,
  manejadorErrores,
} = require('./proveedores.errors');

const router = express.Router();

// -----------------------------------------------------------------------------
// Endpoints
// -----------------------------------------------------------------------------

// POST /api/proveedores
router.post(
  '/',
  validator.validarCrear,
  controller.crear
);

// GET /api/proveedores?pagina=&limite=&busqueda=
router.get(
  '/',
  validator.validarListar,
  controller.listar
);

// GET /api/proveedores/:id
router.get(
  '/:id',
  validator.validarIdParam,
  controller.obtenerPorId
);

// PUT /api/proveedores/:id
router.put(
  '/:id',
  validator.validarIdParam,
  validator.validarActualizar,
  controller.actualizar
);

// DELETE /api/proveedores/:id
// Borrado fisico: la tabla no tiene columna activo.
router.delete(
  '/:id',
  validator.validarIdParam,
  controller.eliminar
);

// -----------------------------------------------------------------------------
// Manejo de errores del módulo
// Estos middleware deben permanecer al final.
// -----------------------------------------------------------------------------

router.use(rutaNoEncontrada);
router.use(manejadorErrores);

module.exports = router;
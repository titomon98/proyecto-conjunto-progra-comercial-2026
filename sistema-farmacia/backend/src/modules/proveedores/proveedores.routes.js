'use strict';

/**
 * proveedores.routes.js — DEFINICIÓN DE ENDPOINTS
 * ---------------------------------------------------------------------------
 * Dueño original: Integrante B. Ajustes de integración: Integrante D.
 *
 * REGLA DEL README: esta capa solo llama al controller. No importa el service
 * ni el model.
 *
 * ORDEN DE CADA RUTA:  validador(es)  →  controller
 * El validador corta la petición con 400 antes de que llegue al controller, así
 * que el controller siempre trabaja con datos limpios.
 *
 * Los middlewares de error van AL FINAL y en este orden:
 *   1. rutaNoEncontrada  → 404 para rutas inexistentes dentro de /api/proveedores
 *   2. manejadorErrores  → traduce errores de dominio a HTTP
 * Viven dentro de la carpeta del módulo, NO en backend/src/middlewares/, que es
 * archivo compartido entre los 7 equipos.
 */

const express = require('express');

const controller = require('./proveedores.controller');
const validator = require('./proveedores.validator');
const { rutaNoEncontrada, manejadorErrores } = require('./proveedores.errors');

const router = express.Router();

// --- Endpoints -------------------------------------------------------------

// POST /api/proveedores
router.post('/', validator.validarCrear, controller.crear);

// GET /api/proveedores?pagina=&limite=&busqueda=&activo=
router.get('/', validator.validarListar, controller.listar);

// GET /api/proveedores/:id
router.get('/:id', validator.validarIdParam, controller.obtenerPorId);

// PUT /api/proveedores/:id
router.put('/:id', validator.validarIdParam, validator.validarActualizar, controller.actualizar);

// DELETE /api/proveedores/:id — borrado LÓGICO
router.delete('/:id', validator.validarIdParam, controller.desactivar);

// --- Manejo de errores del módulo (siempre al final) -----------------------

router.use(rutaNoEncontrada);
router.use(manejadorErrores);

module.exports = router;
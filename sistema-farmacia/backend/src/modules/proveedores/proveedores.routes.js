// backend/src/modules/proveedores/proveedores.routes.js
// Dueña: Integrante B — Capa HTTP (routes → controller)
//
// Regla del README: esta capa solo llama al controller. No importa el
// service ni el model directamente.
//
// NOTA sobre validación: los endpoints que reciben body (POST, PUT) deberían
// pasar antes por el middleware de D (proveedores.validator.js), que vive
// DENTRO de esta carpeta (no en backend/src/middlewares/, que es compartido).
// En cuanto D te entregue ese archivo, monta cada validador así:
//
//   const { validarCrear, validarActualizar } = require('./proveedores.validator');
//   router.post('/', validarCrear, controller.crear);
//   router.put('/:id', validarActualizar, controller.actualizar);
//
// Mientras tanto, las rutas quedan sin validador para no bloquearte.

const express = require('express');
const router = express.Router();
const controller = require('./proveedores.controller');

router.post('/', controller.crear);
router.get('/', controller.listar);
router.get('/:id', controller.obtenerPorId);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.desactivar);

module.exports = router;
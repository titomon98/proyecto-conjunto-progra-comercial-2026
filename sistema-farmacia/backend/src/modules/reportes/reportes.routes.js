// Rutas del modulo reportes.
// Responsabilidad: mapear cada endpoint HTTP con su funcion del controller.
const { Router } = require('express');
const reportesController = require('./reportes.controller');

const router = Router();

router.get('/ventas', reportesController.ventasPorPeriodo);
router.get('/ventas-clientes', reportesController.ventasPorCliente);

module.exports = router;

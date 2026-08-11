// backend/src/modules/ventas/ventas.routes.js
const { Router } = require('express');
const ventasController = require('./ventas.controller');

const router = Router();

// POST http://localhost:3000/api/ventas -> Crear Venta
router.post('/', ventasController.registrarVenta);

// GET http://localhost:3000/api/ventas -> Listar Ventas
router.get('/', ventasController.obtenerVentas);

module.exports = router;

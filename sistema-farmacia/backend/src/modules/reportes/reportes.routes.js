const { Router } = require('express');
const reportesController = require('./reportes.controller');

const router = Router();

router.get('/medicamentos-mas-vendidos', reportesController.medicamentosMasVendidos);
router.get('/ventas-diarias', reportesController.ventasDiarias);

module.exports = router;
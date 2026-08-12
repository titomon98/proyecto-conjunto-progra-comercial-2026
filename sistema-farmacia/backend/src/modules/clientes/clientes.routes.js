// Rutas del modulo clientes.
// Responsabilidad: mapear cada endpoint HTTP con su funcion del controller.
const { Router } = require('express');
const clientesController = require('./clientes.controller');

const router = Router();

router.get('/', clientesController.listar);
router.get('/:id', clientesController.obtenerPorId);
router.post('/', clientesController.crear);
router.put('/:id', clientesController.actualizar);
router.delete('/:id', clientesController.eliminar);

module.exports = router;
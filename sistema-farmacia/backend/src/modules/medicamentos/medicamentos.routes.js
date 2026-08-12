const { Router } = require('express')
const medicamentosController = require('./medicamentos.controller')

const router = Router()

router.get('/', medicamentosController.listar)
router.get('/:id', medicamentosController.obtenerPorId)
router.post('/', medicamentosController.crear)
router.put('/:id', medicamentosController.actualizar)
router.delete('/:id', medicamentosController.eliminar)

module.exports = router

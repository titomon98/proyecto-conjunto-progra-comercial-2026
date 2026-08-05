const router = require('./medicamentos.routes')
const medicamentosService = require('./medicamentos.service')

module.exports = {
  router,
  obtenerPorId: medicamentosService.obtenerPorId,
}

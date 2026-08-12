const router = require('./medicamentos.routes')
const medicamentosService = require('./medicamentos.service')

module.exports = {
  router,
  obtenerPorId: medicamentosService.obtenerPorId, // para que Inventario/Ventas lo consuman
}

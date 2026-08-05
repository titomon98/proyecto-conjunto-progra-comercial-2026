// Punto de entrada publico del modulo clientes.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./clientes.routes');
const clientesService = require('./clientes.service');

module.exports = {
  router,
  obtenerPorId: clientesService.obtenerPorId,
};
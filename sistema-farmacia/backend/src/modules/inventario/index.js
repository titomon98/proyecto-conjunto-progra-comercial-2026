// Punto de entrada publico del modulo inventario.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./inventario.routes');
const inventarioService = require('./inventario.service');

module.exports = {
  router,
  // Consumido por Ventas al registrar una venta.
  descontarStock: inventarioService.descontarStock,
  // Solo lectura: stock actual de un medicamento.
  consultarStock: inventarioService.consultarStock,
};

// Punto de entrada publico del modulo inventario.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./inventario.routes');

// TODO (equipo inventario): agregar aqui las funciones del service que otros
// modulos necesiten consumir. Ejemplo:
//   const inventarioService = require('./inventario.service');
//   module.exports = { router, obtenerPorId: inventarioService.obtenerPorId };

module.exports = {
  router,
};

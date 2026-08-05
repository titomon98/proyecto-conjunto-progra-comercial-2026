// Punto de entrada publico del modulo ventas.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./ventas.routes');

// TODO (equipo ventas): agregar aqui las funciones del service que otros
// modulos necesiten consumir. Ejemplo:
//   const ventasService = require('./ventas.service');
//   module.exports = { router, obtenerPorId: ventasService.obtenerPorId };

module.exports = {
  router,
};

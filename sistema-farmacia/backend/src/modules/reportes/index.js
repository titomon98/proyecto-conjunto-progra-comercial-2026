// Punto de entrada publico del modulo reportes.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./reportes.routes');

// TODO (equipo reportes): agregar aqui las funciones del service que otros
// modulos necesiten consumir. Ejemplo:
//   const reportesService = require('./reportes.service');
//   module.exports = { router, obtenerPorId: reportesService.obtenerPorId };

module.exports = {
  router,
};

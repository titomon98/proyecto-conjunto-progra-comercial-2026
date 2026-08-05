// Punto de entrada publico del modulo medicamentos.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./medicamentos.routes');

// TODO (equipo medicamentos): agregar aqui las funciones del service que otros
// modulos necesiten consumir. Ejemplo:
//   const medicamentosService = require('./medicamentos.service');
//   module.exports = { router, obtenerPorId: medicamentosService.obtenerPorId };

module.exports = {
  router,
};

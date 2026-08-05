// Punto de entrada publico del modulo proveedores.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./proveedores.routes');

// TODO (equipo proveedores): agregar aqui las funciones del service que otros
// modulos necesiten consumir. Ejemplo:
//   const proveedoresService = require('./proveedores.service');
//   module.exports = { router, obtenerPorId: proveedoresService.obtenerPorId };

module.exports = {
  router,
};

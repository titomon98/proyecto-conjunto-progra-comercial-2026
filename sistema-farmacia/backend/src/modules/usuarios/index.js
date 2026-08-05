// Punto de entrada publico del modulo usuarios.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./usuarios.routes');

// TODO (equipo usuarios): agregar aqui las funciones del service que otros
// modulos necesiten consumir. Ejemplo:
//   const usuariosService = require('./usuarios.service');
//   module.exports = { router, obtenerPorId: usuariosService.obtenerPorId };

module.exports = {
  router,
};
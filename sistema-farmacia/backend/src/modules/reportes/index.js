// Punto de entrada publico del modulo reportes.
// Exporta UNICAMENTE lo que este modulo expone hacia el resto del sistema.
// Los demas archivos del modulo son internos: no deben importarse desde fuera.

const router = require('./reportes.routes');

module.exports = {
  router,
};

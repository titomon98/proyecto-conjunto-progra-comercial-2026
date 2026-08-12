// backend/src/modules/ventas/index.js
// Punto de entrada publico del modulo ventas.
// app.js monta `router`; Reportes consume `obtenerVentasParaReportes`.

const router = require('./ventas.routes');
const ventasService = require('./ventas.service');

module.exports = {
  router,
  obtenerVentasParaReportes: ventasService.obtenerListaVentas,
};

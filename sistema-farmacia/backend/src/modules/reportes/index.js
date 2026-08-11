const router = require('./reportes.routes');
const reportesService = require('./reportes.service');

module.exports = {
  router,
  obtenerMedicamentosMasVendidos: reportesService.obtenerMedicamentosMasVendidos,
  obtenerVentasDiarias: reportesService.obtenerVentasDiarias,
};
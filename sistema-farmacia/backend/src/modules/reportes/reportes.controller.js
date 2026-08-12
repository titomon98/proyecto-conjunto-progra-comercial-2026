// Controller del modulo reportes.
// Responsabilidad: leer la peticion (req), validar la entrada, llamar al service
// y devolver la respuesta (res). No debe contener logica de negocio.

const reportesService = require('./reportes.service');

const ventasPorPeriodo = async (req, res) => {
  try {
    const reporte = await reportesService.generarReporteVentas(req.query);

    return res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al generar el reporte de ventas.',
    });
  }
};

const ventasPorCliente = async (req, res) => {
  try {
    const reporte = await reportesService.generarReporteVentasPorCliente(req.query);

    return res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al generar el reporte de ventas por cliente.',
    });
  }
};

const medicamentosMasVendidos = async (req, res) => {
  try {
    const reporte = await reportesService.generarReporteMedicamentosMasVendidos(req.query);

    return res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al generar el reporte de medicamentos mas vendidos.',
    });
  }
};

const ventasDiarias = async (req, res) => {
  try {
    const reporte = await reportesService.generarReporteVentasDiarias(req.query);

    return res.status(200).json({
      success: true,
      data: reporte,
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al generar el reporte de ventas diarias.',
    });
  }
};

module.exports = {
  ventasPorPeriodo,
  ventasPorCliente,
  medicamentosMasVendidos,
  ventasDiarias,
};

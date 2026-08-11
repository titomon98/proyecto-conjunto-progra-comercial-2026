const reportesService = require('./reportes.service');

const medicamentosMasVendidos = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const data = await reportesService.obtenerMedicamentosMasVendidos({ fechaInicio, fechaFin });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al generar el reporte de medicamentos más vendidos',
    });
  }
};

const ventasDiarias = async (req, res) => {
  try {
    const { fechaInicio, fechaFin } = req.query;
    const data = await reportesService.obtenerVentasDiarias({ fechaInicio, fechaFin });

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error al generar el reporte de ventas diarias',
    });
  }
};

module.exports = { medicamentosMasVendidos, ventasDiarias };
// Service del modulo reportes.
// Responsabilidad: logica de negocio del modulo. No conoce req/res ni Express;
// se apoya en el model para leer datos reales de otros modulos.

const reportesModel = require('./reportes.model');

function crearErrorValidacion(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function validarFecha(valor, nombreCampo) {
  if (!valor) {
    throw crearErrorValidacion(`${nombreCampo} es obligatoria.`);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    throw crearErrorValidacion(`${nombreCampo} debe tener formato YYYY-MM-DD.`);
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`);
  if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== valor) {
    throw crearErrorValidacion(`${nombreCampo} no es una fecha valida.`);
  }

  return fecha;
}

const generarReporteVentas = async ({ fechaInicio, fechaFin }) => {
  const inicio = validarFecha(fechaInicio, 'fechaInicio');
  const fin = validarFecha(fechaFin, 'fechaFin');

  if (inicio > fin) {
    throw crearErrorValidacion('fechaInicio no puede ser posterior a fechaFin.');
  }

  const finDelDia = new Date(fin);
  finDelDia.setUTCHours(23, 59, 59, 999);

  const ventas = await reportesModel.obtenerVentasPorPeriodo(
    inicio.toISOString(),
    finDelDia.toISOString()
  );

  const filas = (ventas ?? []).map((venta) => {
    const totalUnidades = (venta.detalle_ventas ?? []).reduce(
      (suma, detalle) => suma + Number(detalle.cantidad || 0),
      0
    );

    return {
      id_venta: venta.id_venta,
      fecha: venta.fecha,
      cliente: venta.clientes?.nombre ?? 'Cliente no encontrado',
      total_unidades: totalUnidades,
      total: Number(venta.total || 0),
    };
  });

  const resumen = filas.reduce(
    (acc, venta) => ({
      total_ventas: acc.total_ventas + 1,
      total_unidades: acc.total_unidades + venta.total_unidades,
      monto_total: acc.monto_total + venta.total,
    }),
    { total_ventas: 0, total_unidades: 0, monto_total: 0 }
  );

  resumen.monto_total = Number(resumen.monto_total.toFixed(2));

  return {
    periodo: { fechaInicio, fechaFin },
    resumen,
    ventas: filas,
  };
};

const generarReporteVentasPorCliente = async ({ fechaInicio, fechaFin } = {}) => {
  let inicioIso;
  let finIso;

  if (fechaInicio || fechaFin) {
    const inicio = validarFecha(fechaInicio, 'fechaInicio');
    const fin = validarFecha(fechaFin, 'fechaFin');

    if (inicio > fin) {
      throw crearErrorValidacion('fechaInicio no puede ser posterior a fechaFin.');
    }

    const finDelDia = new Date(fin);
    finDelDia.setUTCHours(23, 59, 59, 999);
    inicioIso = inicio.toISOString();
    finIso = finDelDia.toISOString();
  }

  const ventas = await reportesModel.obtenerVentasParaReporteClientes(inicioIso, finIso);
  const porCliente = new Map();

  for (const venta of ventas ?? []) {
    const idCliente = venta.id_cliente || 'sin-cliente';
    const totalUnidades = (venta.detalle_ventas ?? []).reduce(
      (suma, detalle) => suma + Number(detalle.cantidad || 0),
      0
    );

    if (!porCliente.has(idCliente)) {
      porCliente.set(idCliente, {
        id_cliente: idCliente,
        cliente: venta.clientes?.nombre ?? 'Cliente no encontrado',
        cantidad_ventas: 0,
        total_unidades: 0,
        total_comprado: 0,
        ultima_compra: null,
      });
    }

    const cliente = porCliente.get(idCliente);
    cliente.cantidad_ventas += 1;
    cliente.total_unidades += totalUnidades;
    cliente.total_comprado += Number(venta.total || 0);

    if (!cliente.ultima_compra || new Date(venta.fecha) > new Date(cliente.ultima_compra)) {
      cliente.ultima_compra = venta.fecha;
    }
  }

  const clientes = Array.from(porCliente.values())
    .map((cliente) => ({
      ...cliente,
      total_comprado: Number(cliente.total_comprado.toFixed(2)),
    }))
    .sort((a, b) => b.total_comprado - a.total_comprado);

  const resumen = clientes.reduce(
    (acc, cliente) => ({
      total_clientes: acc.total_clientes + 1,
      total_ventas: acc.total_ventas + cliente.cantidad_ventas,
      total_unidades: acc.total_unidades + cliente.total_unidades,
      monto_total: acc.monto_total + cliente.total_comprado,
    }),
    { total_clientes: 0, total_ventas: 0, total_unidades: 0, monto_total: 0 }
  );

  resumen.monto_total = Number(resumen.monto_total.toFixed(2));

  return {
    periodo: fechaInicio && fechaFin ? { fechaInicio, fechaFin } : null,
    resumen,
    clientes,
  };
};

// REPORTE: Medicamentos mas vendidos.
// Fechas opcionales, pero si se usa una se debe usar la otra (igual que el
// reporte de ventas por cliente).
const generarReporteMedicamentosMasVendidos = async ({ fechaInicio, fechaFin } = {}) => {
  let inicioIso;
  let finIso;

  if (fechaInicio || fechaFin) {
    const inicio = validarFecha(fechaInicio, 'fechaInicio');
    const fin = validarFecha(fechaFin, 'fechaFin');

    if (inicio > fin) {
      throw crearErrorValidacion('fechaInicio no puede ser posterior a fechaFin.');
    }

    const finDelDia = new Date(fin);
    finDelDia.setUTCHours(23, 59, 59, 999);
    inicioIso = inicio.toISOString();
    finIso = finDelDia.toISOString();
  }

  const detalles = await reportesModel.obtenerDetalleVentasPorPeriodo(inicioIso, finIso);
  const porMedicamento = new Map();

  for (const detalle of detalles ?? []) {
    const idMedicamento = detalle.id_medicamento;
    if (!idMedicamento) continue;

    if (!porMedicamento.has(idMedicamento)) {
      porMedicamento.set(idMedicamento, {
        id_medicamento: idMedicamento,
        medicamento: detalle.medicamentos?.nombre ?? 'Medicamento no encontrado',
        total_unidades: 0,
        cantidad_ventas: 0,
        monto_total: 0,
      });
    }

    const registro = porMedicamento.get(idMedicamento);
    registro.total_unidades += Number(detalle.cantidad || 0);
    registro.cantidad_ventas += 1;
    registro.monto_total += Number(detalle.subtotal || 0);
  }

  const medicamentos = Array.from(porMedicamento.values())
    .map((medicamento) => ({
      ...medicamento,
      monto_total: Number(medicamento.monto_total.toFixed(2)),
    }))
    .sort((a, b) => b.total_unidades - a.total_unidades);

  const resumen = medicamentos.reduce(
    (acc, medicamento) => ({
      total_medicamentos: acc.total_medicamentos + 1,
      total_unidades: acc.total_unidades + medicamento.total_unidades,
      monto_total: acc.monto_total + medicamento.monto_total,
    }),
    { total_medicamentos: 0, total_unidades: 0, monto_total: 0 }
  );

  resumen.monto_total = Number(resumen.monto_total.toFixed(2));

  return {
    periodo: fechaInicio && fechaFin ? { fechaInicio, fechaFin } : null,
    resumen,
    medicamentos,
  };
};

// REPORTE: Ventas agrupadas por dia.
// Fecha inicial y final son obligatorias. Reutiliza el mismo model que el
// reporte de ventas por periodo (misma forma de datos), y agrupa por dia.
const generarReporteVentasDiarias = async ({ fechaInicio, fechaFin }) => {
  const inicio = validarFecha(fechaInicio, 'fechaInicio');
  const fin = validarFecha(fechaFin, 'fechaFin');

  if (inicio > fin) {
    throw crearErrorValidacion('fechaInicio no puede ser posterior a fechaFin.');
  }

  const finDelDia = new Date(fin);
  finDelDia.setUTCHours(23, 59, 59, 999);

  const ventas = await reportesModel.obtenerVentasPorPeriodo(
    inicio.toISOString(),
    finDelDia.toISOString()
  );

  const porDia = new Map();

  for (const venta of ventas ?? []) {
    const dia = new Date(venta.fecha).toISOString().slice(0, 10);
    const totalUnidades = (venta.detalle_ventas ?? []).reduce(
      (suma, detalle) => suma + Number(detalle.cantidad || 0),
      0
    );

    if (!porDia.has(dia)) {
      porDia.set(dia, {
        fecha: dia,
        cantidad_ventas: 0,
        total_unidades: 0,
        monto_total: 0,
      });
    }

    const registro = porDia.get(dia);
    registro.cantidad_ventas += 1;
    registro.total_unidades += totalUnidades;
    registro.monto_total += Number(venta.total || 0);
  }

  const dias = Array.from(porDia.values())
    .map((dia) => ({ ...dia, monto_total: Number(dia.monto_total.toFixed(2)) }))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));

  const resumen = dias.reduce(
    (acc, dia) => ({
      total_dias: acc.total_dias + 1,
      total_ventas: acc.total_ventas + dia.cantidad_ventas,
      total_unidades: acc.total_unidades + dia.total_unidades,
      monto_total: acc.monto_total + dia.monto_total,
    }),
    { total_dias: 0, total_ventas: 0, total_unidades: 0, monto_total: 0 }
  );

  resumen.monto_total = Number(resumen.monto_total.toFixed(2));

  return {
    periodo: { fechaInicio, fechaFin },
    resumen,
    dias,
  };
};

module.exports = {
  generarReporteVentas,
  generarReporteVentasPorCliente,
  generarReporteMedicamentosMasVendidos,
  generarReporteVentasDiarias,
};

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

const redondear = (numero) => Math.round((Number(numero) || 0) * 100) / 100;

const construirRangoUtc = (fechaInicio, fechaFin) => {
  const inicio = validarFecha(fechaInicio, 'fechaInicio');
  const fin = validarFecha(fechaFin, 'fechaFin');

  if (inicio > fin) {
    throw crearErrorValidacion('fechaInicio no puede ser posterior a fechaFin.');
  }

  const finDelDia = new Date(fin);
  finDelDia.setUTCHours(23, 59, 59, 999);

  return { inicioIso: inicio.toISOString(), finIso: finDelDia.toISOString() };
};

const generarReporteMedicamentosMasVendidos = async ({ fechaInicio, fechaFin } = {}) => {
  let rango = null;

  if (fechaInicio || fechaFin) {
    if (!fechaInicio || !fechaFin) {
      throw crearErrorValidacion(
        'Debe enviar fechaInicio y fechaFin juntas, no solo una de las dos.'
      );
    }
    rango = construirRangoUtc(fechaInicio, fechaFin);
  }

  const [ventas, medicamentos] = await Promise.all([
    reportesModel.obtenerVentasConDetallePorPeriodo(rango?.inicioIso, rango?.finIso),
    reportesModel.obtenerCatalogoMedicamentos(),
  ]);

  const nombres = new Map(medicamentos.map((m) => [m.id_medicamento, m.nombre]));
  const acumulado = new Map();

  for (const venta of ventas ?? []) {
    for (const linea of venta.detalle_ventas ?? []) {
      const item = acumulado.get(linea.id_medicamento) ?? {
        id_medicamento: linea.id_medicamento,
        nombre: nombres.get(linea.id_medicamento) ?? 'Medicamento no encontrado',
        unidades_vendidas: 0,
        monto_total: 0,
        ventas: new Set(),
      };

      item.unidades_vendidas += Number(linea.cantidad) || 0;
      item.monto_total += Number(linea.subtotal) || 0;
      item.ventas.add(venta.id_venta);
      acumulado.set(linea.id_medicamento, item);
    }
  }

  const filas = Array.from(acumulado.values())
    .map((item) => ({
      id_medicamento: item.id_medicamento,
      nombre: item.nombre,
      unidades_vendidas: item.unidades_vendidas,
      cantidad_ventas: item.ventas.size,
      monto_total: redondear(item.monto_total),
      promedio_unidades_por_venta: item.ventas.size
        ? redondear(item.unidades_vendidas / item.ventas.size)
        : 0,
      promedio_monto_por_venta: item.ventas.size
        ? redondear(item.monto_total / item.ventas.size)
        : 0,
    }))
    .sort((a, b) => b.unidades_vendidas - a.unidades_vendidas || b.monto_total - a.monto_total);

  return {
    periodo: rango ? { fechaInicio, fechaFin } : null,
    total_medicamentos: filas.length,
    medicamentos: filas,
  };
};

const generarReporteVentasDiarias = async ({ fechaInicio, fechaFin } = {}) => {
  const rango = construirRangoUtc(fechaInicio, fechaFin);
  const ventas = await reportesModel.obtenerVentasConDetallePorPeriodo(
    rango.inicioIso,
    rango.finIso
  );

  const porDia = new Map();

  for (const venta of ventas ?? []) {
    const dia = new Date(venta.fecha).toISOString().slice(0, 10);
    const item = porDia.get(dia) ?? {
      fecha: dia,
      cantidad_ventas: 0,
      unidades_vendidas: 0,
      monto_total: 0,
    };

    item.cantidad_ventas += 1;
    item.unidades_vendidas += (venta.detalle_ventas ?? []).reduce(
      (suma, detalle) => suma + (Number(detalle.cantidad) || 0),
      0
    );
    item.monto_total += Number(venta.total) || 0;
    porDia.set(dia, item);
  }

  const dias = Array.from(porDia.values())
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((dia) => ({ ...dia, monto_total: redondear(dia.monto_total) }));

  return {
    periodo: { fechaInicio, fechaFin },
    resumen: {
      total_dias_con_ventas: dias.length,
      total_ventas: dias.reduce((suma, dia) => suma + dia.cantidad_ventas, 0),
      total_unidades_vendidas: dias.reduce((suma, dia) => suma + dia.unidades_vendidas, 0),
      monto_total: redondear(dias.reduce((suma, dia) => suma + dia.monto_total, 0)),
    },
    dias,
  };
};

module.exports = {
  generarReporteVentas,
  generarReporteVentasPorCliente,
  generarReporteMedicamentosMasVendidos,
  generarReporteVentasDiarias,
};
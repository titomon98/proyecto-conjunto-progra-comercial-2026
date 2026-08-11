const reportesModel = require('./reportes.model');

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;

const errorHttp = (mensaje, status = 400) => {
  const error = new Error(mensaje);
  error.status = status;
  return error;
};

const esFechaValida = (valor) => {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) return false;
  const fecha = new Date(`${valor}T00:00:00Z`);
  if (Number.isNaN(fecha.getTime())) return false;
  return fecha.toISOString().slice(0, 10) === valor;
};

const inicioDelDia = (fecha) => `${fecha}T00:00:00.000Z`;

const inicioDelDiaSiguiente = (fecha) => {
  const dia = new Date(`${fecha}T00:00:00Z`);
  dia.setUTCDate(dia.getUTCDate() + 1);
  return dia.toISOString();
};

const soloFecha = (valor) => new Date(valor).toISOString().slice(0, 10);

const redondear = (numero) => Math.round((Number(numero) || 0) * 100) / 100;

const resolverRango = (fechaInicio, fechaFin, { obligatorio = false } = {}) => {
  const hayInicio = Boolean(fechaInicio);
  const hayFin = Boolean(fechaFin);

  if (obligatorio && (!hayInicio || !hayFin)) {
    throw errorHttp('fechaInicio y fechaFin son obligatorias con formato YYYY-MM-DD.');
  }
  if (!hayInicio && !hayFin) return null;
  if (hayInicio !== hayFin) {
    throw errorHttp('Debe enviar fechaInicio y fechaFin juntas, no solo una de las dos.');
  }
  if (!esFechaValida(fechaInicio) || !esFechaValida(fechaFin)) {
    throw errorHttp('Fecha inválida: se espera el formato YYYY-MM-DD.');
  }
  if (fechaInicio > fechaFin) {
    throw errorHttp('fechaInicio no puede ser posterior a fechaFin.');
  }

  return { desde: inicioDelDia(fechaInicio), hasta: inicioDelDiaSiguiente(fechaFin) };
};

const obtenerMedicamentosMasVendidos = async ({ fechaInicio, fechaFin } = {}) => {
  const rango = resolverRango(fechaInicio, fechaFin);

  const [ventas, medicamentos] = await Promise.all([
    reportesModel.obtenerVentasConDetalle(rango ?? {}),
    reportesModel.obtenerCatalogoMedicamentos(),
  ]);

  const nombres = new Map(medicamentos.map((m) => [m.id_medicamento, m.nombre]));
  const acumulado = new Map();

  for (const venta of ventas) {
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

  const filas = [...acumulado.values()].map((item) => ({
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
  }));

  filas.sort(
    (a, b) => b.unidades_vendidas - a.unidades_vendidas || b.monto_total - a.monto_total
  );

  return {
    rango: rango ? { fechaInicio, fechaFin } : null,
    total_medicamentos: filas.length,
    medicamentos: filas,
  };
};

const obtenerVentasDiarias = async ({ fechaInicio, fechaFin } = {}) => {
  const rango = resolverRango(fechaInicio, fechaFin, { obligatorio: true });
  const ventas = await reportesModel.obtenerVentasConDetalle(rango);

  const porDia = new Map();

  for (const venta of ventas) {
    const dia = soloFecha(venta.fecha);
    const item = porDia.get(dia) ?? {
      fecha: dia,
      cantidad_ventas: 0,
      unidades_vendidas: 0,
      monto_total: 0,
    };

    item.cantidad_ventas += 1;
    item.unidades_vendidas += (venta.detalle_ventas ?? []).reduce(
      (suma, linea) => suma + (Number(linea.cantidad) || 0),
      0
    );
    item.monto_total += Number(venta.total) || 0;
    porDia.set(dia, item);
  }

  const dias = [...porDia.values()]
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .map((dia) => ({ ...dia, monto_total: redondear(dia.monto_total) }));

  return {
    rango: { fechaInicio, fechaFin },
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
  obtenerMedicamentosMasVendidos,
  obtenerVentasDiarias,
};
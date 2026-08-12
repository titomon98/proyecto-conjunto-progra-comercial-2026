// Model del modulo reportes.
// Responsabilidad: acceso a datos. Unica capa que habla directamente con
// Supabase / PostgreSQL para consultas de solo lectura.

const supabase = require('../../config/supabase');

const obtenerVentasPorPeriodo = async (fechaInicio, fechaFin) => {
  const { data, error } = await supabase
    .from('ventas')
    .select(`
      id_venta,
      fecha,
      total,
      clientes (
        id_cliente,
        nombre
      ),
      detalle_ventas (
        cantidad
      )
    `)
    .gte('fecha', fechaInicio)
    .lte('fecha', fechaFin)
    .order('fecha', { ascending: true });

  if (error) throw error;
  return data;
};

const obtenerVentasParaReporteClientes = async (fechaInicio, fechaFin) => {
  let query = supabase
    .from('ventas')
    .select(`
      id_venta,
      fecha,
      total,
      id_cliente,
      clientes (
        id_cliente,
        nombre
      ),
      detalle_ventas (
        cantidad
      )
    `)
    .order('fecha', { ascending: false });

  if (fechaInicio) query = query.gte('fecha', fechaInicio);
  if (fechaFin) query = query.lte('fecha', fechaFin);

  const { data, error } = await query;

  if (error) throw error;
  return data;
};

const obtenerVentasConDetallePorPeriodo = async (fechaInicio, fechaFin) => {
  let query = supabase
    .from('ventas')
    .select(`
      id_venta,
      fecha,
      total,
      detalle_ventas (
        id_medicamento,
        cantidad,
        subtotal
      )
    `)
    .order('fecha', { ascending: true });

  if (fechaInicio) query = query.gte('fecha', fechaInicio);
  if (fechaFin) query = query.lte('fecha', fechaFin);

  const { data, error } = await query;

  if (error) throw error;
  return data ?? [];
};

const obtenerCatalogoMedicamentos = async () => {
  const { data, error } = await supabase
    .from('medicamentos')
    .select('id_medicamento, nombre');

  if (error) throw error;
  return data ?? [];
};

module.exports = {
  obtenerVentasPorPeriodo,
  obtenerVentasParaReporteClientes,
  obtenerVentasConDetallePorPeriodo,
  obtenerCatalogoMedicamentos,
};

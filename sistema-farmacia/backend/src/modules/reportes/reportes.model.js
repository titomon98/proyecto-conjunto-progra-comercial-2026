const supabase = require('../../config/supabase');

const TABLA_VENTAS = 'ventas';
const TABLA_DETALLE = 'detalle_ventas';
const TABLA_MEDICAMENTOS = 'medicamentos';

const obtenerVentasConDetalle = async ({ desde, hasta } = {}) => {
  let query = supabase
    .from(TABLA_VENTAS)
    .select(`
      id_venta,
      fecha,
      total,
      detalle_ventas (
        id_detalle,
        id_medicamento,
        cantidad,
        subtotal
      )
    `)
    .order('fecha', { ascending: true });

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lt('fecha', hasta);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
};

const obtenerCatalogoMedicamentos = async () => {
  const { data, error } = await supabase
    .from(TABLA_MEDICAMENTOS)
    .select('id_medicamento, nombre');

  if (error) throw error;
  return data ?? [];
};

module.exports = {
  TABLA_VENTAS,
  TABLA_DETALLE,
  TABLA_MEDICAMENTOS,
  obtenerVentasConDetalle,
  obtenerCatalogoMedicamentos,
};
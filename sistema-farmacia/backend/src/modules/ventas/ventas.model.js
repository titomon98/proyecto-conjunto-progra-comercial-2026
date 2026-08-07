// =========================================================
// backend/src/modules/ventas/ventas.model.js
// Módulo: Ventas — Capa de acceso a datos (pura, sin lógica de negocio)
// Responsable: Pedro López
// Rama: feature/ventas-db-model
//
// Este archivo SOLO contiene funciones que interactúan directamente
// con la base de datos (Supabase). No debe contener reglas de negocio
// (ej. descontar stock invocando InventarioService): eso corresponde
// a ventas.service.js, según la Regla de Integración del CONTRATO.md
// (Sección 4).
// =========================================================

const supabase = require('../../config/supabaseClient');

const TABLA_VENTAS = 'ventas';
const TABLA_DETALLE = 'detalle_ventas';

/**
 * Inserta una nueva venta.
 * @param {{id_cliente: string, id_usuario: string, total: number}} venta
 */
async function crearVenta({ id_cliente, id_usuario, total }) {
  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .insert([{ id_cliente, id_usuario, total }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Inserta una o varias líneas de detalle asociadas a una venta.
 * @param {Array<{id_venta: string, id_medicamento: string, cantidad: number, subtotal: number}>} detalles
 */
async function crearDetalleVenta(detalles) {
  const { data, error } = await supabase
    .from(TABLA_DETALLE)
    .insert(detalles)
    .select();

  if (error) throw error;
  return data;
}

/**
 * Obtiene una venta por su id_venta.
 */
async function obtenerVentaPorId(id_venta) {
  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .select('*')
    .eq('id_venta', id_venta)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Obtiene una venta junto con todas sus líneas de detalle.
 */
async function obtenerVentaConDetalle(id_venta) {
  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .select(`
      *,
      detalle_ventas (
        id_detalle,
        id_medicamento,
        cantidad,
        subtotal
      )
    `)
    .eq('id_venta', id_venta)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Lista ventas con paginación básica y filtro opcional por rango de fechas.
 * @param {{desde?: string, hasta?: string, limite?: number, pagina?: number}} opciones
 */
async function listarVentas({ desde, hasta, limite = 50, pagina = 1 } = {}) {
  let query = supabase
    .from(TABLA_VENTAS)
    .select('*')
    .order('fecha', { ascending: false })
    .range((pagina - 1) * limite, pagina * limite - 1);

  if (desde) query = query.gte('fecha', desde);
  if (hasta) query = query.lte('fecha', hasta);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Lista las ventas realizadas por un cliente específico.
 */
async function listarVentasPorCliente(id_cliente) {
  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .select('*')
    .eq('id_cliente', id_cliente)
    .order('fecha', { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Actualiza el total de una venta (uso interno, ej. al recalcular el detalle).
 */
async function actualizarTotalVenta(id_venta, total) {
  const { data, error } = await supabase
    .from(TABLA_VENTAS)
    .update({ total })
    .eq('id_venta', id_venta)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Elimina una venta. Por la FK ON DELETE CASCADE, su detalle se elimina junto con ella.
 * Nota: esto borra filas, no la tabla — no choca con la prohibición de DROP/TRUNCATE
 * de la Sección 3 del CONTRATO, pero úsese con cautela.
 */
async function eliminarVenta(id_venta) {
  const { error } = await supabase
    .from(TABLA_VENTAS)
    .delete()
    .eq('id_venta', id_venta);

  if (error) throw error;
  return true;
}

module.exports = {
  crearVenta,
  crearDetalleVenta,
  obtenerVentaPorId,
  obtenerVentaConDetalle,
  listarVentas,
  listarVentasPorCliente,
  actualizarTotalVenta,
  eliminarVenta,
};

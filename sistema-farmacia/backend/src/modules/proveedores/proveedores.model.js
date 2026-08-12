'use strict';

/**
 * proveedores.model.js — ACCESO A DATOS
 *
 * REGLAS DE ESTA CAPA (README del repo):
 *   - Unica capa que habla con Supabase / PostgreSQL.
 *   - Sin logica de negocio y sin conocer Express: nada de req ni res.
 *   - Devuelve datos crudos o null; los errores de dominio los lanza el service.
 *
 * COLUMNAS REALES DE LA TABLA (CONTRATO.md seccion 3):
 *   id_proveedor (PK, UUID) | nombre | contacto | created_at
 *
 * No existen las columnas telefono, email, direccion ni activo. Por eso el
 * modulo no hace borrado logico: el DELETE es fisico y la integridad la protege
 * la llave foranea de Medicamentos, que PostgreSQL rechaza con el codigo 23503.
 */

const supabase = require('../../config/supabase');

const TABLA = 'proveedores';

/** Escapa los comodines de LIKE/ILIKE para que un nombre con % o _ no filtre de mas. */
function escaparComodines(texto) {
  return String(texto).replace(/[%_]/g, (m) => `\\${m}`);
}

/**
 * Lista proveedores paginados, con busqueda opcional por nombre.
 * @param {{ pagina: number, limite: number, busqueda: string|null }} opciones
 * @returns {Promise<{ datos: object[], total: number }>}
 */
async function obtenerTodos({ pagina = 1, limite = 10, busqueda = null } = {}) {
  const desde = (pagina - 1) * limite;
  const hasta = desde + limite - 1;

  let consulta = supabase
    .from(TABLA)
    .select('*', { count: 'exact' })
    .order('nombre', { ascending: true })
    .range(desde, hasta);

  if (busqueda) {
    consulta = consulta.ilike('nombre', `%${escaparComodines(busqueda)}%`);
  }

  const { data, error, count } = await consulta;
  if (error) throw error;

  return { datos: data || [], total: count || 0 };
}

/**
 * @param {string} id - UUID.
 * @returns {Promise<object|null>} null si no existe.
 */
async function obtenerPorId(id) {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('id_proveedor', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no encontrado, no es un error real
    throw error;
  }
  return data;
}

/**
 * Indica si el nombre ya esta tomado. La comparacion es insensible a
 * mayusculas: "Farmacia Sur" y "farmacia sur" cuentan como el mismo proveedor.
 * @param {string} nombre
 * @param {string} [idExcluir] - Id a ignorar, para no chocar consigo mismo al editar.
 * @returns {Promise<boolean>}
 */
async function existePorNombre(nombre, idExcluir) {
  let consulta = supabase
    .from(TABLA)
    .select('id_proveedor')
    .ilike('nombre', escaparComodines(nombre));

  if (idExcluir) {
    consulta = consulta.neq('id_proveedor', idExcluir);
  }

  const { data, error } = await consulta;
  if (error) throw error;

  return (data || []).length > 0;
}

/**
 * @param {{ nombre: string, contacto: string|null }} datos
 * @returns {Promise<object>}
 */
async function crear(datos) {
  const { data, error } = await supabase
    .from(TABLA)
    .insert(datos)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * @param {string} id - UUID.
 * @param {object} cambios - Solo las columnas a modificar.
 * @returns {Promise<object|null>} null si el id no existe.
 */
async function actualizar(id, cambios) {
  const { data, error } = await supabase
    .from(TABLA)
    .update(cambios)
    .eq('id_proveedor', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

/**
 * Borrado fisico. Si el proveedor tiene medicamentos asociados, PostgreSQL
 * rechaza el DELETE con el codigo 23503 y el error se propaga al service.
 * @param {string} id - UUID.
 * @returns {Promise<object|null>} null si el id no existe.
 */
async function eliminar(id) {
  const { data, error } = await supabase
    .from(TABLA)
    .delete()
    .eq('id_proveedor', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

module.exports = {
  TABLA,
  obtenerTodos,
  obtenerPorId,
  existePorNombre,
  crear,
  actualizar,
  eliminar,
};

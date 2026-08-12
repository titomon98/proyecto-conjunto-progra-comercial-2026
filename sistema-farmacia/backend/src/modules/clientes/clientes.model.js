// Model del modulo clientes.
// Responsabilidad: acceso a datos. Unica capa que habla directamente con
// Supabase / PostgreSQL para la(s) tabla(s) de este modulo.

const supabase = require('../../config/supabase');

const TABLA = 'clientes';

const findAll = async () => {
  const { data, error } = await supabase.from(TABLA).select('*');
  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('id_cliente', id)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const insert = async (datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .insert(datos)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const update = async (id, datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .update(datos)
    .eq('id_cliente', id)
    .select()
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

const remove = async (id) => {
  const { data, error } = await supabase
    .from(TABLA)
    .delete()
    .eq('id_cliente', id)
    .select()
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

module.exports = {
  TABLA,
  findAll,
  findById,
  insert,
  update,
  remove,
};
// Model del modulo usuarios.
// Responsabilidad: acceso a datos. Unica capa que habla directamente con
// Supabase / PostgreSQL para la(s) tabla(s) de este modulo.

const { supabase } = require('../../config/supabase');

const TABLA = 'usuarios';

const findAll = async () => {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id, nombre, email, rol, activo, created_at')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from(TABLA)
    .select('id, nombre, email, rol, activo, created_at')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

const findByEmail = async (email) => {
  const { data, error } = await supabase
    .from(TABLA)
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

const insert = async (datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .insert(datos)
    .select('id, nombre, email, rol, activo, created_at')
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .update(datos)
    .eq('id', id)
    .select('id, nombre, email, rol, activo, created_at')
    .single();

  if (error) throw error;
  return data;
};

const remove = async (id) => {
  const { data, error } = await supabase
    .from(TABLA)
    .delete()
    .eq('id', id)
    .select('id')
    .single();

  if (error) throw error;
  return data;
};

module.exports = {
  TABLA,
  findAll,
  findById,
  findByEmail,
  insert,
  update,
  remove,
};

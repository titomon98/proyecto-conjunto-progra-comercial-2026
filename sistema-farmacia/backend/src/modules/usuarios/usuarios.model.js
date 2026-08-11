// Model del modulo usuarios.
// Responsabilidad: acceso a datos. Unica capa que habla directamente con
// Supabase / PostgreSQL para la(s) tabla(s) de este modulo.
//
// Columnas reales de la tabla usuarios (CONTRATO.md seccion 3):
//   id_usuario (PK, UUID) | email | password | rol | created_at
// No existen las columnas nombre, activo ni password_hash.

const supabase = require('../../config/supabase');

const TABLA = 'usuarios';

// Campos que se devuelven hacia afuera. Se excluye password a proposito para no
// filtrar credenciales en los listados ni en las respuestas del CRUD.
const CAMPOS_PUBLICOS = 'id_usuario, email, rol, created_at';

const findAll = async () => {
  const { data, error } = await supabase
    .from(TABLA)
    .select(CAMPOS_PUBLICOS)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const findById = async (id) => {
  const { data, error } = await supabase
    .from(TABLA)
    .select(CAMPOS_PUBLICOS)
    .eq('id_usuario', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // no encontrado, no es un error real
    throw error;
  }
  return data;
};

// Devuelve la fila completa (incluida password) porque el login la necesita.
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
    .select(CAMPOS_PUBLICOS)
    .single();

  if (error) throw error;
  return data;
};

const update = async (id, datos) => {
  const { data, error } = await supabase
    .from(TABLA)
    .update(datos)
    .eq('id_usuario', id)
    .select(CAMPOS_PUBLICOS)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
};

const remove = async (id) => {
  const { data, error } = await supabase
    .from(TABLA)
    .delete()
    .eq('id_usuario', id)
    .select('id_usuario')
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
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

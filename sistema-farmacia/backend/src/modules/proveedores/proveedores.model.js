// Model del modulo proveedores.
// Responsabilidad: acceso a datos. Unica capa que habla directamente con
// Supabase / PostgreSQL para la(s) tabla(s) de este modulo.

const TABLA = 'proveedores';

// TODO (equipo proveedores): implementar las consultas del modulo.
const findAll = async () => {};

const findById = async (id) => {};

const insert = async (datos) => {};

const update = async (id, datos) => {};

const remove = async (id) => {};

module.exports = {
  TABLA,
  findAll,
  findById,
  insert,
  update,
  remove,
};

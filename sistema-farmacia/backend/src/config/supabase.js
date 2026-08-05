// Configuracion del cliente de Supabase (PostgreSQL).
// PLACEHOLDER: aqui NO se abre ninguna conexion real todavia.
// Cuando el equipo de infraestructura habilite las credenciales, descomentar
// la creacion del cliente y llenar las variables en el archivo .env.

// const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// TODO: reemplazar este placeholder por el cliente real.
//   const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const supabase = null;

module.exports = {
  supabase,
  SUPABASE_URL,
  SUPABASE_KEY,
};

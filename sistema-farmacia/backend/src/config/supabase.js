// Cliente de Supabase (PostgreSQL) compartido por todo el backend.
// Se crea una sola vez y se reutiliza desde los model de cada modulo.
const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

// Node 20 no incluye WebSocket nativo y supabase-js lo necesita para inicializar
// su cliente de Realtime. Le pasamos el paquete "ws" como transporte.
// Si el equipo migra a Node >= 22, esta opcion se puede eliminar.
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    realtime: { transport: ws },
  }
);

module.exports = supabase;

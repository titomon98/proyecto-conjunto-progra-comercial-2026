// Punto de entrada del backend.
// Responsabilidad: crear la app de Express, registrar middlewares globales y
// montar el router publico de cada modulo bajo su prefijo /api.
// dotenv debe cargarse ANTES de requerir config/supabase, porque ese archivo
// lee process.env al momento de crear el cliente.
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const supabase = require('./config/supabase');

const usuarios = require('./modules/usuarios');
const clientes = require('./modules/clientes');
const proveedores = require('./modules/proveedores');
const medicamentos = require('./modules/medicamentos');
const inventario = require('./modules/inventario');
const ventas = require('./modules/ventas');
const reportes = require('./modules/reportes');

const app = express();

// El frontend corre en otro puerto (Vite, 5173) que el backend (3000), asi que el
// navegador trata cada fetch como cross-origin y lo bloquea sin esta cabecera.
// Se deja abierto a proposito: cada equipo levanta Vite en el puerto que le toque
// libre (5173, 5174...). Si algun dia esto se despliega, restringir con
// cors({ origin: 'https://dominio-real' }).
app.use(cors());

app.use(express.json());

// Health check: confirma que el backend responde y que la conexion a Supabase
// funciona, contando los registros de la tabla usuarios.
app.get('/api/health', async (req, res) => {
  const { count, error } = await supabase
    .from('usuarios')
    .select('*', { count: 'exact', head: true });

  if (error) {
    return res.status(503).json({
      ok: false,
      supabase: 'error',
      mensaje: error.message,
    });
  }

  return res.json({
    ok: true,
    supabase: 'conectado',
    tabla: 'usuarios',
    registros: count,
  });
});

app.use('/api/usuarios', usuarios.router);
app.use('/api/clientes', clientes.router);
app.use('/api/proveedores', proveedores.router);
app.use('/api/medicamentos', medicamentos.router);
app.use('/api/inventario', inventario.router);
app.use('/api/ventas', ventas.router);
app.use('/api/reportes', reportes.router);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend escuchando en http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
  res.json({ mensaje: 'API Sistema de Farmacia - ver /api/health para status' });
});
module.exports = app;

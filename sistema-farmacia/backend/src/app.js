// Punto de entrada del backend.
// Responsabilidad: crear la app de Express, registrar middlewares globales y
// montar el router publico de cada modulo bajo su prefijo /api.
require('dotenv').config();
const express = require('express');

const usuarios = require('./modules/usuarios');
const clientes = require('./modules/clientes');
const proveedores = require('./modules/proveedores');
const medicamentos = require('./modules/medicamentos');
const inventario = require('./modules/inventario');
const ventas = require('./modules/ventas');
const reportes = require('./modules/reportes');

const app = express();

app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

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

module.exports = app;

// frontend/src/modules/ventas/ventas.demo.js
// Datos de respaldo para poder desarrollar y demostrar la pantalla mientras
// Clientes y Medicamentos terminan de integrarse a develop.
// BORRAR cuando ambos modulos expongan sus endpoints.

export const CLIENTES_DEMO = [
  { id_cliente: 'c-001', nombre: 'Consumidor final', nit: 'CF' },
  { id_cliente: 'c-002', nombre: 'Ana Lucía Morales', nit: '5544332-1' },
  { id_cliente: 'c-003', nombre: 'Clínica San Rafael', nit: '1029384-7' },
  { id_cliente: 'c-004', nombre: 'Rodrigo Estrada', nit: '8877665-K' },
];

export const MEDICAMENTOS_DEMO = [
  { id_medicamento: 'm-001', nombre: 'Acetaminofén 500mg', precio: 12.5, stock_actual: 120 },
  { id_medicamento: 'm-002', nombre: 'Amoxicilina 500mg', precio: 45.0, stock_actual: 8 },
  { id_medicamento: 'm-003', nombre: 'Ibuprofeno 400mg', precio: 18.75, stock_actual: 64 },
  { id_medicamento: 'm-004', nombre: 'Loratadina 10mg', precio: 22.0, stock_actual: 0 },
  { id_medicamento: 'm-005', nombre: 'Omeprazol 20mg', precio: 35.9, stock_actual: 31 },
  { id_medicamento: 'm-006', nombre: 'Suero oral 500ml', precio: 9.0, stock_actual: 5 },
];

// TODO (ventas): reemplazar por el usuario autenticado cuando el modulo de
// Usuarios exponga la sesion. Por ahora se envia fijo en el POST.
export const ID_USUARIO_SESION = 'u-001';

// frontend/src/modules/clientes/index.js
// Punto de entrada publico del modulo clientes en el frontend.
// El resto del sistema (App.jsx, Ventas, Reportes) solo importa desde aqui.

export { default as ClientesView } from './ClientesView.jsx';
export { obtenerClientes } from './clientes.api.js';

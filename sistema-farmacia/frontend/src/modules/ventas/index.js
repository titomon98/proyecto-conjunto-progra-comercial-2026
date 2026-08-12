// frontend/src/modules/ventas/index.js
// Punto de entrada publico del modulo ventas en el frontend.
// El resto del sistema (App.jsx, Reportes, etc.) solo importa desde aqui.

export { default as VentasPage } from './VentasPage.jsx';
export { obtenerVentas } from './ventas.api.js';

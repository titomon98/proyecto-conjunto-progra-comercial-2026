// frontend/src/modules/inventario/index.js
// Punto de entrada publico del modulo inventario en el frontend.
// El resto del sistema (App.jsx, Ventas, Reportes) solo importa desde aqui.

export { default as InventarioView } from './InventarioView.jsx';
export { obtenerInventario } from './inventario.api.js';
